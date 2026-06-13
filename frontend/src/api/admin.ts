import { API_URL } from './client';

const TOKEN_KEY = 'tour_admin_token';

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function adminLogin(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Ongeldige inloggegevens');
  const { token } = await res.json();
  setToken(token);
}

export async function updateFavorites(stageId: number, riderIds: number[]): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/stages/${stageId}/favorites`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ riderIds }),
  });
  if (res.status === 401) {
    clearToken();
    throw new Error('Sessie verlopen, log opnieuw in');
  }
  if (!res.ok) throw new Error('Opslaan mislukt');
}
