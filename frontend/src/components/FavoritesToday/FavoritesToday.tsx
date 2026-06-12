import React from 'react';
import { Rider } from '../../types';
import { Panel } from '../Panel/Panel';
import styles from './FavoritesToday.module.css';

interface FavoritesTodayProps {
  favorites: Rider[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function FavoritesToday({ favorites, selectedId, onSelect }: FavoritesTodayProps) {
  return (
    <Panel title="Favorieten vandaag">
      <ol className={styles.list}>
        {favorites.map((rider) => {
          const selected = rider.id === selectedId;
          return (
            <li key={rider.id}>
              <button
                className={selected ? `${styles.row} ${styles.rowSelected}` : styles.row}
                onClick={() => onSelect(rider.id)}
              >
                <span className={styles.rider}>
                  <span className={styles.name}>{rider.name}</span>
                  <span className={styles.team}>{rider.team}</span>
                </span>
                {selected && <span className={styles.check} aria-hidden="true">&#10003;</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export { FavoritesToday };
