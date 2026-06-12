import React from 'react';
import { Stage } from '../../types';
import styles from './StageBanner.module.css';

function StageBanner({ stage }: { stage: Stage }) {
  return (
    <p className={styles.banner}>
      <span className={styles.number}>Etappe {stage.number}</span>
      <span>
        {stage.start} &rarr; {stage.finish} &middot; {stage.distanceKm} km
      </span>
      <span className={styles.type}>{stage.stageType}</span>
    </p>
  );
}

export { StageBanner };
