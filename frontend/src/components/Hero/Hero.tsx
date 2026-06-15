import React from 'react';
import { NosLogo } from '../../svg/NosLogo';
import styles from './Hero.module.css';

interface HeroProps {
  children: React.ReactNode;
}

function Hero({ children }: HeroProps) {
  return (
    <header className={styles.hero}>
      <div className={styles.nosLogoWrap}>
        <NosLogo className={styles.nosLogo} title="NOS" />
      </div>
      <div className={styles.inner}>{children}</div>
    </header>
  );
}

export { Hero };
