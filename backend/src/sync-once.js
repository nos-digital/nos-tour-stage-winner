// Run-once entrypoint for the Infostrada sync.
//
// Used by the Kubernetes CronJob (and the local docker-compose `sync` service):
// the same image is started with `node src/sync-once.js` instead of the API.
// It syncs riders + GC standings once, then exits — 0 on success, 1 on failure,
// so the platform (k8s Job / compose) can report and retry.
import { waitForDatabase, pool } from './db.js';
import { syncStages, syncRiders, syncGc } from './sync.js';

let code = 0;
try {
  await waitForDatabase();
  await syncStages();
  await syncRiders();
  await syncGc();
} catch (err) {
  console.error('Sync failed:', err);
  code = 1;
} finally {
  // mysql2 keeps pooled connections open; without this the process hangs.
  await pool.end();
}
process.exit(code);
