import { Stage } from '../types';
import { getJson } from './client';

export function fetchStages(): Promise<Stage[]> {
  return getJson<Stage[]>('/api/stages');
}
