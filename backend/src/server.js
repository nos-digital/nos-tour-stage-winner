import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { waitForDatabase } from './db.js';
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

const PORT = Number(process.env.PORT ?? 3000);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Built frontend, copied into the image by the Dockerfile. Absent in local dev
// (where CRA serves the frontend on :3000), so static serving is guarded below.
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
app.set('trust proxy', 1);
// Full CSP stays off: the frontend loads a cross-origin font (static.nos.nl) and
// the previous nginx host set no CSP, so this keeps parity without blocking assets.
// We do set a minimal policy with only frame-ancestors so nos.nl can embed us in
// an iframe. X-Frame-Options can't whitelist a cross-origin parent (only
// DENY/SAMEORIGIN), so we disable frameguard and rely on frame-ancestors instead.
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        // Only frame-ancestors — default-src is explicitly disabled so nothing
        // else is restricted (keeps parity with the previous no-CSP setup and the
        // cross-origin font). helmet otherwise errors demanding a default-src.
        'default-src': helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
        'frame-ancestors': ["'self'", 'https://nos.nl', 'https://*.nos.nl'],
      },
    },
  })
);
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

// Unknown /api routes return JSON; everything else falls through to the SPA.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Serve the built frontend and let client-side routing handle the rest.
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, { maxAge: '1y', index: false }));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

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
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
