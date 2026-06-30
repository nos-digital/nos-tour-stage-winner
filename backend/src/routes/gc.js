import { Router } from 'express';
import { pool } from '../db.js';
import { cacheFor } from '../helpers.js';

const router = Router();

router.get('/', cacheFor(60), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT g.\`rank\`, g.name, g.team, g.result, g.time_gap AS timeGap, r.id AS riderId
     FROM gc_standings g
     LEFT JOIN riders r ON r.person_id = g.person_id
     ORDER BY g.\`rank\``
  );
  res.json(rows);
});

export default router;
