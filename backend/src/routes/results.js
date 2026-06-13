import { Router } from 'express';
import { pool } from '../db.js';
import { isId } from '../helpers.js';
import { getCachedResults, setCachedResults } from '../cache.js';

const router = Router();

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  let stageId = null;
  if (req.query.stageId !== undefined) {
    stageId = Number(req.query.stageId);
    if (!isId(stageId)) {
      return res.status(400).json({ error: 'stageId must be a positive integer' });
    }
  }
  const cacheKey = stageId ?? 'all';
  const cached = getCachedResults(cacheKey);
  if (cached) return res.json(cached);

  const [rows] = await pool.query(
    `SELECT sr.stage_id AS stageId, sr.rider_id AS riderId, r.name AS riderName,
            r.team AS riderTeam, sr.total_votes AS totalVotes
     FROM stage_results sr
     JOIN riders r ON r.id = sr.rider_id
     ${stageId ? 'WHERE sr.stage_id = ?' : ''}
     ORDER BY sr.stage_id, sr.total_votes DESC`,
    stageId ? [stageId] : []
  );
  setCachedResults(cacheKey, rows);
  res.json(rows);
});

export default router;
