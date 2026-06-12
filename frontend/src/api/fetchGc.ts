import { GcEntry } from '../types';
import { getJson } from './client';

export function fetchGc(): Promise<GcEntry[]> {
  return getJson<GcEntry[]>('/api/gc');
}
