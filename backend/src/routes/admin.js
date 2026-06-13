import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { isId, safeEq } from '../helpers.js';
import { requireAdmin } from '../middleware.js';
import { invalidateResults } from '../cache.js';

const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body ?? {};
  const ok = safeEq(username, process.env.ADMIN_USERNAME) &&
             safeEq(password, process.env.ADMIN_PASSWORD);
  if (!ok) {
    console.warn(`[auth] failed login attempt from ${req.ip}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

router.put('/stages/:id/favorites', requireAdmin, async (req, res) => {
  const stageId = Number(req.params.id);
  if (!isId(stageId)) return res.status(400).json({ error: 'Invalid stage id' });
  const riderIds = req.body?.riderIds;
  if (!Array.isArray(riderIds) || riderIds.length > 20 || riderIds.some((id) => !isId(id))) {
    return res.status(400).json({ error: 'riderIds must be an array of 1–20 positive integers' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM stage_favorites WHERE stage_id = ?', [stageId]);
    for (let i = 0; i < riderIds.length; i++) {
      await conn.execute(
        'INSERT INTO stage_favorites (stage_id, rider_id, position) VALUES (?, ?, ?)',
        [stageId, riderIds[i], i + 1]
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  invalidateResults(stageId);
  res.json({ ok: true });
});

export default router;
