import React from 'react';
import styles from './Panel.module.css';

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

function Panel({ title, children }: PanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export { Panel };
