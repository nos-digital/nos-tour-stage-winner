import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { waitForDatabase } from './db.js';
import { startSync } from './sync.js';
import ridersRouter from './routes/riders.js';
import stagesRouter from './routes/stages.js';
import resultsRouter from './routes/results.js';
import gcRouter from './routes/gc.js';
import votesRouter from './routes/votes.js';
import adminRouter from './routes/admin.js';

if (!process.env.JWT_SECRET || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error('FATAL: JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD must be set');
  process.exit(1);
}

const PORT = Number(process.env.PORT ?? 8090);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT'],
  })
);
app.use(express.json({ limit: '1kb' }));

app.use(rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok' });
});

app.use('/api/riders', ridersRouter);
app.use('/api/stages', stagesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/gc', gcRouter);
app.use('/api/votes', votesRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

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

await waitForDatabase();
startSync();
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
