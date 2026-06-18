import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { isId, UUID_RE } from '../helpers.js';
import { invalidateResults } from '../cache.js';

const voteLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/', voteLimiter, async (req, res) => {
  const { stageId, riderId, userId } = req.body ?? {};
  if (!isId(stageId) || !isId(riderId) || !UUID_RE.test(userId)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  await pool.execute(
    `INSERT INTO votes (stage_id, rider_id, user_id) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rider_id = VALUES(rider_id)`,
    [stageId, riderId, userId]
  );
  // Drop the cached tally so the voter immediately sees their vote on /results.
  invalidateResults(stageId);
  invalidateResults('all');
  res.status(201).json({ ok: true });
});

export default router;
