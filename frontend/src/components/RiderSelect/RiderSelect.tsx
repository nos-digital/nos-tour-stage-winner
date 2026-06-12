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
  const rest = riders.filter((r) => !r.outOfRace && !favoriteIds.has(r.id));
  const activeFavorites = favorites.filter((f) => !f.outOfRace);

  return (
    <select
      className={styles.select}
      value={selectedId ?? ''}
      onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
      aria-label="Selecteer renner"
    >
      <option value="">Selecteer renner</option>
      {activeFavorites.map((rider) => (
        <option key={rider.id} value={rider.id}>
          {rider.name}
        </option>
      ))}
      {activeFavorites.length > 0 && rest.length > 0 && (
        <option disabled value="">
          ─────────────────────
        </option>
      )}
      {rest.map((rider) => (
        <option key={rider.id} value={rider.id}>
          {rider.name}
        </option>
      ))}
    </select>
  );
}

export { RiderSelect };
