import React, { useEffect, useState } from 'react';
import { fetchGc } from '../../api';
import { GcEntry } from '../../types';
import { Panel } from '../Panel/Panel';
import styles from './GeneralClassification.module.css';

const INITIAL_COUNT = 10;

function GeneralClassification() {
  const [entries, setEntries] = useState<GcEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchGc()
      .then(setEntries)
      .catch(() => setError(true));
  }, []);

  const visible = entries && (showAll ? entries : entries.slice(0, INITIAL_COUNT));

  return (
    <Panel title="Algemeen klassement">
      {!entries && !error && <p>Laden&hellip;</p>}
      {error && <p>Klassement niet beschikbaar.</p>}
      {visible && (
        <>
          <ol className={styles.list}>
            {visible.map((entry) => (
              <li
                key={entry.rank}
                className={entry.rank === 1 ? `${styles.row} ${styles.rowLeader}` : styles.row}
              >
                <span className={styles.rank}>{entry.rank}</span>
                <span className={styles.rider}>
                  <span className={styles.name}>{entry.name}</span>
                  <span className={styles.team}>{entry.team}</span>
                </span>
                <span className={styles.gap}>
                  {entry.timeGap === 0 ? 'Gele trui' : entry.result}
                </span>
              </li>
            ))}
          </ol>
          {!showAll && entries.length > INITIAL_COUNT && (
            <button className={styles.showAll} onClick={() => setShowAll(true)}>
              Toon alle {entries.length} renners
            </button>
          )}
        </>
      )}
    </Panel>
  );
}

export { GeneralClassification };
