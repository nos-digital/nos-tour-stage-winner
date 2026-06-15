import { pool } from './db.js';
import { cap } from './helpers.js';

export async function syncRiders() {
  const url = process.env.RIDERS_API_URL;
  const user = process.env.GC_API_USER;
  const pass = process.env.GC_API_PASS;
  if (!url || !user || !pass) {
    console.warn('Riders sync skipped: RIDERS_API_URL not configured');
    return;
  }
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const upstream = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!upstream.ok) throw new Error(`Infostrada returned ${upstream.status}`);
  const data = await upstream.json();
  if (!data.length) return;
  for (const r of data) {
    await pool.execute(
      `INSERT INTO riders (person_id, number, name, team, out_of_race)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), number = VALUES(number), team = VALUES(team), out_of_race = VALUES(out_of_race)`,
      [r.n_PersonID, r.c_ShirtNr ? parseInt(r.c_ShirtNr, 10) : null, cap(r.c_Person, 100), cap(r.c_Team, 100), r.b_OutOfRace ? 1 : 0]
    );
  }
  console.log(`Riders synced: ${data.length} riders`);
}

export async function syncGc() {
  const url = process.env.GC_API_URL;
  const user = process.env.GC_API_USER;
  const pass = process.env.GC_API_PASS;
  if (!url || !user || !pass) {
    console.warn('GC sync skipped: GC_API_URL/USER/PASS not configured');
    return;
  }
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const upstream = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!upstream.ok) throw new Error(`Infostrada returned ${upstream.status}`);
  const data = await upstream.json();
  if (!data.length) return;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM gc_standings');
    const placeholders = data.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const values = data.flatMap((r) => [
      r.n_RankSort,
      cap(r.c_Participant, 100),
      cap(r.c_Team, 100),
      cap(r.c_Result, 20),
      r.n_TimeRel,
    ]);
    await conn.execute(
      `INSERT INTO gc_standings (\`rank\`, name, team, result, time_gap) VALUES ${placeholders}`,
      values
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  console.log(`GC synced: ${data.length} riders`);
}
