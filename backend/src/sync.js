import { pool } from './db.js';
import { cap } from './helpers.js';

const INFOSTRADA_BASE = 'http://nos.api.infostradasports.com/svc/Cycling.svc/json';

// True when the given endpoint id and the shared credentials are all present.
function infostradaConfigured(id) {
  return Boolean(id && process.env.INFOSTRADA_API_USER && process.env.INFOSTRADA_API_PASSWORD);
}

// Build the URL for an Infostrada method, fetch it with basic auth and a 10s
// timeout, and return the parsed JSON. LanguageCode 1 = Dutch.
async function fetchInfostrada(method, params) {
  const qs = new URLSearchParams({ ...params, LanguageCode: '1' });
  const auth = Buffer.from(
    `${process.env.INFOSTRADA_API_USER}:${process.env.INFOSTRADA_API_PASSWORD}`
  ).toString('base64');
  const res = await fetch(`${INFOSTRADA_BASE}/${method}?${qs}`, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Infostrada ${method} returned ${res.status}`);
  return res.json();
}

// Infostrada serialises dates as `/Date(<ms>+<offset>)/`. For the *Local*
// fields the ms value already has the offset baked in, so reading the ms as
// UTC and taking the date part yields the local calendar date.
function parseInfostradaDate(value) {
  const m = /\/Date\((-?\d+)/.exec(value ?? '');
  if (!m) return null;
  return new Date(Number(m[1])).toISOString().slice(0, 10);
}

// Map an Infostrada phase to our editorial stage_type ENUM. Time trials come
// straight from c_Event; road races ("Wegwedstrijd") are split flat/hilly/
// mountain by n_RouteProfileType (1/2/3). Returns null on an unrecognised
// profile so the caller can log and skip rather than insert a wrong type.
function mapStageType(phase) {
  const event = (phase.c_Event ?? '').toLowerCase();
  if (event.includes('ploegentijdrit')) return 'ploegentijdrit';
  if (event.includes('tijdrit')) return 'tijdrit';
  switch (phase.n_RouteProfileType) {
    case 1: return 'vlakke rit';
    case 2: return 'heuvelrit';
    case 3: return 'bergrit';
    default: return null;
  }
}

export async function syncStages() {
  const phaseId = process.env.INFOSTRADA_PHASE_ID;
  if (!infostradaConfigured(phaseId)) {
    console.warn('Stages sync skipped: INFOSTRADA_PHASE_ID or credentials not configured');
    return;
  }
  const data = await fetchInfostrada('GetStageList', { PhaseId: phaseId });
  if (!data.length) return;

  let synced = 0;
  for (const p of data) {
    // c_PhaseShort is the cycling stage number ("10"); n_PhaseNr is the global
    // phase counter that also counts rest days, so it drifts out of step.
    const number = parseInt(p.c_PhaseShort, 10);
    const date = parseInfostradaDate(p.d_DateStartLocal);
    const type = mapStageType(p);
    if (!number || !date) continue;
    if (!type) {
      console.warn(`Stage ${number} skipped: unmapped type (event="${p.c_Event}", profile=${p.n_RouteProfileType})`);
      continue;
    }
    // Upsert on the unique `number` key — never DELETE/re-INSERT, or the
    // auto-increment id changes and orphans stage_favorites rows.
    await pool.execute(
      `INSERT INTO stages (\`number\`, \`date\`, start, finish, distance_km, stage_type)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`date\` = VALUES(\`date\`), start = VALUES(start),
         finish = VALUES(finish), distance_km = VALUES(distance_km), stage_type = VALUES(stage_type)`,
      [number, date, cap(p.c_LocationStart, 100), cap(p.c_LocationFinish, 100), Math.round((p.n_Distance ?? 0) / 1000), type]
    );
    synced += 1;
  }
  console.log(`Stages synced: ${synced} stages`);
}

export async function syncRiders() {
  const phaseId = process.env.INFOSTRADA_PHASE_ID;
  if (!infostradaConfigured(phaseId)) {
    console.warn('Riders sync skipped: INFOSTRADA_PHASE_ID or credentials not configured');
    return;
  }
  const data = await fetchInfostrada('GetParticipantList', { EventPhaseID: phaseId });
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
  const classificationId = process.env.INFOSTRADA_GC_CLASSIFICATION_ID;
  if (!infostradaConfigured(classificationId)) {
    console.warn('GC sync skipped: INFOSTRADA_GC_CLASSIFICATION_ID or credentials not configured');
    return;
  }
  const data = await fetchInfostrada('GetResult', { ClassificationID: classificationId });
  if (!data.length) return;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM gc_standings');
    const placeholders = data.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const values = data.flatMap((r) => [
      r.n_RankSort,
      r.n_PersonID ?? null,
      cap(r.c_Participant, 100),
      cap(r.c_Team, 100),
      cap(r.c_Result, 20),
      r.n_TimeRel,
    ]);
    await conn.execute(
      `INSERT INTO gc_standings (\`rank\`, person_id, name, team, result, time_gap) VALUES ${placeholders}`,
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
