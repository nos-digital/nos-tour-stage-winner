import React from 'react';
import styles from './Hero.module.css';

interface HeroProps {
  compact?: boolean;
  children: React.ReactNode;
}

function Hero({ compact = false, children }: HeroProps) {
  return (
    <header className={compact ? `${styles.hero} ${styles.compact}` : styles.hero}>
      <div className={styles.inner}>{children}</div>
    </header>
  );
}

export { Hero };
