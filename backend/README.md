# Tour stage winner — backend

Express.js REST API with a MariaDB database, both running in Docker.
(Admin UI: planned, not built yet — manage data via SQL for now.)

## Quick start

```sh
cp .env.example .env   # then set strong random passwords
docker compose up -d --build
```

- API: http://localhost:8090/api/
- MariaDB is **not** exposed to the host; only the API container can reach it.
  To inspect data: `docker exec -it tour-db mariadb -utour -p tour`
- Schema + seed (`db/init/*.sql`) run automatically the first time the
  database volume is created. To re-seed from scratch:
  `docker compose down -v && docker compose up -d --build`

## Endpoints

| Method | Path | Description | Cache-Control |
|---|---|---|---|
| GET | `/api/health` | liveness check | no-store |
| GET | `/api/riders` | all riders | `max-age=300, swr=600` |
| GET | `/api/stages` | all 2026 stages incl. `favorites` (suggested winners) | `max-age=300, swr=600` |
| GET | `/api/results?stageId=1` | vote totals per rider (most-chosen first) | `max-age=30, swr=60` |
| POST | `/api/votes` | cast a vote: `{"stageId": 1, "riderId": 2}` | — |

All GET endpoints are CDN-cacheable out of the box — put a CDN/reverse proxy
in front for large-scale traffic and the origin only sees a trickle.

## Database

`riders`, `stages`, `stage_favorites` (suggested winners per stage, ordered),
`votes`, and the `stage_results` view (`COUNT(*)` per stage/rider — the only
public face of votes; raw votes are never exposed through the API).

## OWASP Top 10

| Risk | How it's covered |
|---|---|
| A01 Broken access control | No write endpoints except `POST /api/votes`; raw votes have no read endpoint, only aggregated `stage_results`. |
| A02 Cryptographic failures | No credentials/PII stored yet. **Production: terminate TLS in front of the API.** |
| A03 Injection | All queries use parameterized statements (`mysql2` placeholders); ids validated as positive integers before touching the database. |
| A04 Insecure design | Minimal surface; FK constraints reject unknown stage/rider ids; request bodies capped at 1 kB. |
| A05 Security misconfiguration | helmet security headers; non-root containers; DB not reachable from outside the Docker network; no default credentials (all from `.env`). |
| A06 Vulnerable components | 5 direct dependencies, pinned via `package-lock.json`; `npm audit` clean at install time. |
| A07 Auth failures | No auth yet (votes are anonymous); rate limiting: 300 req/min general, 20 votes/min per IP. When auth lands, bcrypt + unique vote per user/stage. |
| A08 Integrity failures | Schema versioned in `db/init/` SQL files, reviewed in code. |
| A09 Logging & monitoring | Errors logged server-side without leaking internals to clients; `/api/health` for uptime checks. |
| A10 SSRF | The API makes no outbound requests. |

## Next steps

- Admin UI + authenticated admin endpoints for managing stages/riders/favorites.
- User accounts so each user gets exactly one vote per stage
  (unique index on `votes(stage_id, user_id)`).
- Production: TLS, CDN in front (cache headers are already set),
  `trust proxy` + per-user rate limits behind the proxy, DB backups.
