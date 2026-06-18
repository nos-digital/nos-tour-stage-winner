import { Stage } from '../types';

export function todayYMD(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function getActiveStage(stages: Stage[]): Stage | null {
  if (stages.length === 0) {
    return null;
  }
  const sorted = [...stages].sort((a, b) => a.number - b.number);
  // Active stage = the first one that hasn't finished yet. Once a stage
  // finishes (Infostrada `b_Finished`, refreshed by the sync) the next one
  // opens for voting. When the whole race is done, fall back to the last stage.
  return sorted.find((s) => !s.finished) ?? sorted[sorted.length - 1];
}
