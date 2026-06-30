// Run-once entrypoint to apply the database schema.
//
// Mirrors sync-once.js: start the same image with `node src/schema-once.js`
// (or run it locally) to execute the .sql files in db/init against the
// database, then exit — 0 on success, 1 on failure.
//
// These are the same files Docker runs via docker-entrypoint-initdb.d, but
// that only happens on a fresh data volume. This script lets you apply the
// schema to an already-running / externally-managed database. The CREATE
// statements are not idempotent, so run it against an empty schema.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { waitForDatabase, pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const initDir = path.join(__dirname, '..', 'db', 'init');

let code = 0;
let conn;
try {
  await waitForDatabase();

  // The shared pool disallows multiple statements per query; open a dedicated
  // connection that permits running a whole .sql file at once.
  conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'tour',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? 'tour',
    multipleStatements: true,
  });

  const files = (await fs.readdir(initDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = await fs.readFile(path.join(initDir, file), 'utf8');
    await conn.query(sql);
    console.log(`Applied ${file}`);
  }
} catch (err) {
  console.error('Schema apply failed:', err);
  code = 1;
} finally {
  if (conn) await conn.end();
  // db.js opens a pool on import; close it so the process can exit.
  await pool.end();
}
process.exit(code);
