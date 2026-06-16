import { Router } from 'express';
import { pool } from '../db.js';
import { cacheFor } from '../helpers.js';

const router = Router();

router.get('/', cacheFor(300), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT g.\`rank\`, g.name, g.team, g.result, g.time_gap AS timeGap, r.id AS riderId
     FROM gc_standings g
     LEFT JOIN riders r ON r.person_id = g.person_id
     ORDER BY g.\`rank\``
  );
  if (rows.length === 0) {
    return res.status(503).json({ error: 'GC data not yet available' });
  }
  res.json(rows);
});

export default router;
