import React from 'react';
import { Link } from 'react-router-dom';
import { NosLogo } from '../../svg/NosLogo';
import styles from './Hero.module.css';

interface HeroProps {
  children: React.ReactNode;
}

function Hero({ children }: HeroProps) {
  return (
    <header className={styles.hero}>
      <Link to="/" className={styles.nosLogoWrap} aria-label="Naar startpagina">
        <NosLogo className={styles.nosLogo} title="NOS" />
      </Link>
      <div className={styles.inner}>{children}</div>
    </header>
  );
}

export { Hero };
