import { Router } from 'express';
import { pool } from '../db.js';
import { cacheFor } from '../helpers.js';

const router = Router();

router.get('/', cacheFor(300), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT `rank`, name, team, result, time_gap AS timeGap FROM gc_standings ORDER BY `rank`'
  );
  if (rows.length === 0) {
    return res.status(503).json({ error: 'GC data not yet available' });
  }
  res.json(rows);
});

export default router;
