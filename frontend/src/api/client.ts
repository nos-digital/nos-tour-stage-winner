// Empty by default → same-origin relative requests (the Express server serves
// this build). Local `npm start` proxies /api to :8090 (see package.json proxy).
export const API_URL = process.env.REACT_APP_API_URL ?? '';

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}
