// Run-once entrypoint to wipe all application data.
//
// Mirrors sync-once.js: start the same image with `node src/truncate-once.js`
// (or run it locally) to delete every row from the data tables, then exit —
// 0 on success, 1 on failure. The schema itself is left intact.
//
// Uses DELETE rather than TRUNCATE: TRUNCATE requires the DROP privilege, which
// the app DB user (tour_user) doesn't have. DELETE only needs DELETE. Note this
// does NOT reset AUTO_INCREMENT counters, unlike TRUNCATE.
import readline from 'node:readline/promises';
import { waitForDatabase, pool } from './db.js';

// Order is irrelevant while FK checks are off, but listed children-first anyway.
const TABLES = ['votes', 'stage_favorites', 'gc_standings', 'riders', 'stages'];

// Destructive: require an explicit typed confirmation before wiping data.
// Pass --yes (or set TRUNCATE_CONFIRM=truncate) to skip in non-interactive use.
async function confirm() {
  if (process.argv.includes('--yes') || process.env.TRUNCATE_CONFIRM === 'truncate') {
    return true;
  }
  const db = process.env.DB_NAME ?? 'tour';
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.warn(`\n⚠️  This will permanently DELETE ALL DATA from "${db}":`);
    console.warn(`    ${TABLES.join(', ')}\n`);
    const answer = await rl.question("Type 'truncate' to confirm: ");
    return answer.trim() === 'truncate';
  } finally {
    rl.close();
  }
}

if (!(await confirm())) {
  console.error('Aborted: confirmation not given.');
  await pool.end();
  process.exit(1);
}

let code = 0;
try {
  await waitForDatabase();
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) {
      const [result] = await conn.query(`DELETE FROM \`${table}\``);
      console.log(`Deleted ${result.affectedRows} rows from ${table}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    conn.release();
  }
} catch (err) {
  console.error('Truncate failed:', err);
  code = 1;
} finally {
  // mysql2 keeps pooled connections open; without this the process hangs.
  await pool.end();
}
process.exit(code);
