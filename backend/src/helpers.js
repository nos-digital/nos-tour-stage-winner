import { timingSafeEqual } from 'node:crypto';

export const isId = (value) => Number.isInteger(value) && value > 0;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const cacheFor = (seconds) => (req, res, next) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
  next();
};

export const cap = (s, n) => String(s ?? '').slice(0, n);

export const safeEq = (a, b) => {
  const ba = Buffer.from(a ?? '');
  const bb = Buffer.from(b ?? '');
  const len = Math.max(ba.length, bb.length, 1);
  return timingSafeEqual(Buffer.concat([ba], len), Buffer.concat([bb], len));
};
