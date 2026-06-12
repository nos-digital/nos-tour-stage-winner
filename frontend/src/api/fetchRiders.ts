import { Rider } from '../types';
import { getJson } from './client';

export function fetchRiders(): Promise<Rider[]> {
  return getJson<Rider[]>('/api/riders');
}
