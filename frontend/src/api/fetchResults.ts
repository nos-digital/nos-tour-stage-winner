import { StageResult } from '../types';
import { getJson } from './client';

export function fetchResults(stageId: number): Promise<StageResult[]> {
  return getJson<StageResult[]>(`/api/results?stageId=${stageId}`);
}
