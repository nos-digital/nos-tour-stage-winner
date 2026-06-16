import React from 'react';
import { StageResult } from '../../types';
import styles from './ResultsList.module.css';

export interface ResultRow {
  result: StageResult;
  rank: number;
  percentage: number;
  /** Highlight this row (e.g. the user's own pick). */
  highlighted?: boolean;
  /** Render a "···" separator above this row. */
  separatorBefore?: boolean;
  /** Optional node rendered inside the row (e.g. a share button). */
  action?: React.ReactNode;
}

interface ResultsListProps {
  rows: ResultRow[];
}

function ResultsList({ rows }: ResultsListProps) {
  return (
    <ol className={styles.resultsList}>
      {rows.map(({ result, rank, percentage, highlighted, separatorBefore, action }) => (
        <React.Fragment key={result.riderId}>
          {separatorBefore && (
            <li className={styles.resultSeparator} aria-hidden="true">
              &middot;&middot;&middot;
            </li>
          )}
          <li className={highlighted ? `${styles.resultRow} ${styles.resultRowTop}` : styles.resultRow}>
            <span className={styles.resultRank}>{rank}</span>
            <span className={styles.resultInfo}>
              <span className={styles.resultName}>
                {result.riderNumber != null && (
                  <span className={styles.resultNumber}>{result.riderNumber}</span>
                )}
                {result.riderName}
              </span>
              <span className={styles.resultTeam}>{result.riderTeam}</span>
              <span className={styles.resultBarTrack} aria-hidden="true">
                <span className={styles.resultBar} style={{ width: `${percentage}%` }} />
              </span>
              {action}
            </span>
            <span className={styles.resultVotes}>
              {result.totalVotes === 1 ? '1 stem' : `${result.totalVotes} stemmen`}
              <span className={styles.resultPercentage}>{percentage}%</span>
            </span>
          </li>
        </React.Fragment>
      ))}
    </ol>
  );
}

export { ResultsList };
