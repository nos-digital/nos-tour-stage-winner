import { Router } from 'express';
import { pool } from '../db.js';
import { cacheFor } from '../helpers.js';

const router = Router();

router.get('/', cacheFor(300), async (req, res) => {
  const [stages] = await pool.query(
    'SELECT id, `number`, `date`, start, finish, distance_km AS distanceKm, stage_type AS stageType FROM stages ORDER BY `number`'
  );
  const [favorites] = await pool.query(
    `SELECT sf.stage_id AS stageId, r.id, r.number, r.name, r.team
     FROM stage_favorites sf
     JOIN riders r ON r.id = sf.rider_id
     ORDER BY sf.stage_id, sf.position`
  );
  res.json(
    stages.map((stage) => ({
      ...stage,
      favorites: favorites
        .filter((f) => f.stageId === stage.id)
        .map(({ stageId, ...rider }) => rider),
    }))
  );
});

export default router;
