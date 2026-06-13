import React from 'react';
import { Rider } from '../../types';
import styles from './RiderSelect.module.css';

interface RiderSelectProps {
  riders: Rider[];
  favorites?: Rider[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

function RiderSelect({ riders, favorites = [], selectedId, onSelect }: RiderSelectProps) {
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const activeFavorites = favorites.filter((f) => !f.outOfRace);

  // Active non-favorite riders, sorted by bib number when available, else by team + name
  const restRiders = riders
    .filter((r) => !r.outOfRace && !favoriteIds.has(r.id))
    .sort((a, b) => {
      if (a.number != null && b.number != null) return a.number - b.number;
      if (a.number != null) return -1;
      if (b.number != null) return 1;
      const teamCmp = a.team.localeCompare(b.team);
      return teamCmp !== 0 ? teamCmp : a.name.localeCompare(b.name);
    });

  // Group by team, preserving the sort order above
  const teamMap = new Map<string, Rider[]>();
  for (const rider of restRiders) {
    const team = rider.team || 'Overig';
    if (!teamMap.has(team)) teamMap.set(team, []);
    teamMap.get(team)!.push(rider);
  }

  // Global counter so labels read 1 … N across all teams
  let counter = 0;

  return (
    <select
      className={styles.select}
      value={selectedId ?? ''}
      onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
      aria-label="Selecteer renner"
    >
      <option value="">Selecteer renner</option>

      {activeFavorites.length > 0 && (
        <optgroup label="Favorieten vandaag">
          {activeFavorites.map((rider) => (
            <option key={rider.id} value={rider.id}>
              {rider.number ? `${rider.number}. ${rider.name}` : rider.name}
            </option>
          ))}
        </optgroup>
      )}

      {Array.from(teamMap.entries()).map(([team, teamRiders]) => (
        <optgroup key={team} label={team}>
          {teamRiders.map((rider) => {
            counter += 1;
            const num = rider.number ?? counter;
            return (
              <option key={rider.id} value={rider.id}>
                {num}. {rider.name}
              </option>
            );
          })}
        </optgroup>
      ))}
    </select>
  );
}

export { RiderSelect };
