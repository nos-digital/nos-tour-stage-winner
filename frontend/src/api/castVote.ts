import { API_URL } from './client';
import { getUserId } from './userId';

export async function castVote(stageId: number, riderId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stageId, riderId, userId: getUserId() }),
  });
  if (!res.ok) throw new Error(`Vote failed: ${res.status}`);
}
