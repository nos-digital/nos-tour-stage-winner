# NOS — Tour stage winner

Vote on the predicted winner of each 2026 Tour de France stage.

- **backend/** — Express.js REST API backed by MariaDB ([details](backend/README.md))
- **frontend/** — React (Create React App) UI ([details](frontend/README.md))

## Run locally (dev)

The database runs in Docker; the backend and frontend run on the host with
live-reload. From the repo root:

```sh
npm install   # installs root, backend and frontend deps
npm run dev   # starts the DB, syncs data from Infostrada, runs backend + frontend
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/ (try `/api/health`)
- The first `npm run dev` copies `.env` and `frontend/.env` from their
  `.example` files if missing — edit `.env` and set real passwords plus your
  Infostrada credentials (`INFOSTRADA_API_USER` / `INFOSTRADA_API_PASSWORD`,
  see [infostrada.md](infostrada.md)).
- Backend runs via `node --watch` (restarts on file changes); frontend via the
  CRA dev server. Stop both with Ctrl-C.
- The DB keeps running in the background; stop it with `npm run dev:down`.

### Data

The `riders`, `stages` and GC tables are **not** seeded by SQL — they are
populated from the Infostrada API. `npm run dev` runs that sync once on startup
(after the DB is up). The sync is non-fatal: if Infostrada is unreachable or
credentials are missing, dev still starts and you can sync later. Without it the
tables are empty, so the app shows no riders to select.

- Re-sync on demand (e.g. for newly added stages/results): `npm run dev:sync`
- The data persists in the `db_data` Docker volume between runs.
- Wipe and start fresh: `docker compose down -v` then `npm run dev`.

Other scripts: `npm run dev:db` (DB only), `npm run dev:backend`,
`npm run dev:frontend`, `npm run dev:sync` (Infostrada sync).

## Run locally (full stack in Docker)

To run everything (API + DB) in containers, prod-like, instead of on the host:

```sh
[ -f .env ] || cp .env.example .env
docker compose up -d --build
```

The API serves the built frontend and the API on http://localhost:3000. The
database is **not** exposed to the host in this mode.

## Deployment

See [DEPLOY.md](DEPLOY.md) for building and rolling out on the CHP cluster.
