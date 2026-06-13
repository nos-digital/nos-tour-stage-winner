const resultsCache = new Map();
const TTL_MS = 10_000;

export function getCachedResults(key) {
  const entry = resultsCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}

export function setCachedResults(key, data) {
  resultsCache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export function invalidateResults(key) {
  resultsCache.delete(key);
}
