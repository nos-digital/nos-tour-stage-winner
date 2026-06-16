import React, { useEffect } from 'react';
import { Rider, Stage } from '../../types';
import { ShareVote } from './ShareVote';
import styles from './ShareDialog.module.css';

interface ShareDialogProps {
  rider: Rider;
  stage: Stage;
  onClose: () => void;
}

function ShareDialog({ rider, stage, onClose }: ShareDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Deel jouw keuze"
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Sluiten">
          &times;
        </button>
        <ShareVote rider={rider} stage={stage} />
      </div>
    </div>
  );
}

export { ShareDialog };
