import { Router } from 'express';
import { pool } from '../db.js';
import { cacheFor } from '../helpers.js';

const router = Router();

router.get('/', cacheFor(60), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, number, name, team, out_of_race AS outOfRace FROM riders ORDER BY team, number, name'
  );
  res.json(rows.map((r) => ({ ...r, outOfRace: Boolean(r.outOfRace) })));
});

export default router;
