import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { pool, waitForDatabase } from './db.js';

const PORT = Number(process.env.PORT ?? 8090);

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
    methods: ['GET', 'POST'],
  })
);
app.use(express.json({ limit: '1kb' }));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const voteLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// CDN/proxy cache hints: stages and riders barely change, results may lag a bit.
const cacheFor = (seconds) => (req, res, next) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
  next();
};

const isId = (value) => Number.isInteger(value) && value > 0;

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok' });
});

app.get('/api/riders', cacheFor(300), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, team, out_of_race AS outOfRace FROM riders ORDER BY name'
  );
  res.json(rows.map((r) => ({ ...r, outOfRace: Boolean(r.outOfRace) })));
});

app.get('/api/stages', cacheFor(300), async (req, res) => {
  const [stages] = await pool.query(
    'SELECT id, `number`, `date`, start, finish, distance_km AS distanceKm, stage_type AS stageType FROM stages ORDER BY `number`'
  );
  const [favorites] = await pool.query(
    `SELECT sf.stage_id AS stageId, r.id, r.name, r.team
     FROM stage_favorites sf
     JOIN riders r ON r.id = sf.rider_id
     ORDER BY sf.stage_id, sf.position`
  );
  res.json(
    stages.map((stage) => ({
      ...stage,
      favorites: favorites
        .filter((f) => f.stageId === stage.id)
        .map(({ stageId, ...rider }) => rider),
    }))
  );
});

// Most chosen riders, optionally for one stage: /api/results?stageId=1
app.get('/api/results', cacheFor(30), async (req, res) => {
  const filters = [];
  const params = [];
  if (req.query.stageId !== undefined) {
    const stageId = Number(req.query.stageId);
    if (!isId(stageId)) {
      return res.status(400).json({ error: 'stageId must be a positive integer' });
    }
    filters.push('sr.stage_id = ?');
    params.push(stageId);
  }
  const [rows] = await pool.query(
    `SELECT sr.stage_id AS stageId, sr.rider_id AS riderId, r.name AS riderName,
            r.team AS riderTeam, sr.total_votes AS totalVotes
     FROM stage_results sr
     JOIN riders r ON r.id = sr.rider_id
     ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
     ORDER BY sr.stage_id, sr.total_votes DESC`,
    params
  );
  res.json(rows);
});

app.get('/api/gc', cacheFor(300), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT `rank`, name, team, result, time_gap AS timeGap FROM gc_standings ORDER BY `rank`'
  );
  if (rows.length === 0) {
    return res.status(503).json({ error: 'GC data not yet available' });
  }
  res.json(rows);
});

app.post('/api/votes', voteLimiter, async (req, res) => {
  const { stageId, riderId, userId } = req.body ?? {};
  if (!isId(stageId) || !isId(riderId) || typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'stageId and riderId must be positive integers, userId must be a non-empty string' });
  }
  await pool.execute(
    `INSERT INTO votes (stage_id, rider_id, user_id) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rider_id = VALUES(rider_id)`,
    [stageId, riderId, userId]
  );
  res.status(201).json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler: map known cases, never leak internals.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Unknown stage or rider' });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function syncRiders() {
  const url = process.env.RIDERS_API_URL;
  const user = process.env.GC_API_USER;
  const pass = process.env.GC_API_PASS;
  if (!url || !user || !pass) {
    console.warn('Riders sync skipped: RIDERS_API_URL not configured');
    return;
  }
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const upstream = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!upstream.ok) throw new Error(`Infostrada returned ${upstream.status}`);
  const data = await upstream.json();
  if (!data.length) return;
  for (const r of data) {
    await pool.execute(
      `INSERT INTO riders (person_id, name, team, out_of_race)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), team = VALUES(team), out_of_race = VALUES(out_of_race)`,
      [r.n_PersonID, r.c_Person, r.c_Team, r.b_OutOfRace ? 1 : 0]
    );
  }
  console.log(`Riders synced: ${data.length} riders`);
}

async function syncGc() {
  const url = process.env.GC_API_URL;
  const user = process.env.GC_API_USER;
  const pass = process.env.GC_API_PASS;
  if (!url || !user || !pass) {
    console.warn('GC sync skipped: GC_API_URL/USER/PASS not configured');
    return;
  }
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const upstream = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!upstream.ok) throw new Error(`Infostrada returned ${upstream.status}`);
  const data = await upstream.json();
  if (!data.length) return;
  const placeholders = data.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const values = data.flatMap((r) => [r.n_RankSort, r.c_Participant, r.c_Team, r.c_Result, r.n_TimeRel]);
  await pool.execute('DELETE FROM gc_standings');
  await pool.execute(
    `INSERT INTO gc_standings (\`rank\`, name, team, result, time_gap) VALUES ${placeholders}`,
    values
  );
  console.log(`GC synced: ${data.length} riders`);
}

await waitForDatabase();
syncRiders().catch((err) => console.error('Initial riders sync failed:', err));
syncGc().catch((err) => console.error('Initial GC sync failed:', err));
cron.schedule('*/5 * * * *', () => syncRiders().catch((err) => console.error('Riders sync failed:', err)));
cron.schedule('*/5 * * * *', () => syncGc().catch((err) => console.error('GC sync failed:', err)));

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
