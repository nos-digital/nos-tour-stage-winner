import { Rider } from '../types';

const STORAGE_KEY = 'tour_votes';

function readAll(): Record<number, Rider> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveVote(stageId: number, rider: Rider): void {
  const votes = readAll();
  votes[stageId] = rider;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

export function getStoredVote(stageId: number): Rider | null {
  return readAll()[stageId] ?? null;
}
