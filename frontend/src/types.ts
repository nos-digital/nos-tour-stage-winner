export interface Rider {
  id: number;
  number?: number;
  name: string;
  team: string;
  outOfRace?: boolean;
}

export interface Stage {
  id: number;
  number: number;
  /** Stage date as YYYY-MM-DD */
  date: string;
  start: string;
  finish: string;
  distanceKm: number;
  stageType: string;
  /** True once the stage has finished (from Infostrada). */
  finished: boolean;
  /** Suggested winners for this stage */
  favorites: Rider[];
}

export interface StageResult {
  stageId: number;
  riderId: number;
  riderName: string;
  riderTeam: string;
  riderNumber: number | null;
  totalVotes: number;
}

export interface ClassificationEntry {
  rank: number;
  rider: Rider;
  /** Time gap to the leader, e.g. "+ 4:24". Empty for the leader. */
  gap: string;
}

export interface GcEntry {
  rank: number;
  name: string;
  team: string;
  /** Total time for the leader (e.g. "83:22:51"), gap for others (e.g. "+5:22"). */
  result: string;
  /** Time gap to leader in milliseconds; 0 for the leader. */
  timeGap: number;
  /** Matching rider id (via person_id), so the row can be voted on. Null if unmatched. */
  riderId: number | null;
}
