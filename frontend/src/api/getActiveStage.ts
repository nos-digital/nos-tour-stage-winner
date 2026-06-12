import { Stage } from '../types';

export function todayYMD(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function getActiveStage(stages: Stage[], today: string): Stage | null {
  if (stages.length === 0) {
    return null;
  }
  const sorted = [...stages].sort((a, b) => a.number - b.number);
  return (
    sorted.find((s) => s.date === today) ??
    sorted.find((s) => s.date > today) ??
    sorted[sorted.length - 1]
  );
}
