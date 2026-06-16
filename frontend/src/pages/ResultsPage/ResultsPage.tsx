import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hero } from '../../components/Hero/Hero';
import { Panel } from '../../components/Panel/Panel';
import { StageBanner } from '../../components/StageBanner/StageBanner';
import { ShareDialog } from '../../components/ShareVote/ShareDialog';
import { PageView } from '../../components/PageView/PageView';
import { clickTracking } from '../../components/NosTracker/NosTracker';
import { fetchResults, getStoredVote } from '../../api';
import { Rider, Stage, StageResult } from '../../types';
import { LoadStatus } from '../../App';
import styles from './ResultsPage.module.css';

interface ResultsPageProps {
  status: LoadStatus;
  stage: Stage | null;
}

function ResultsPage({ status, stage }: ResultsPageProps) {
  const location = useLocation();
  const routeVotedRider = (location.state as { votedRider?: Rider } | null)?.votedRider;
  const votedRider = routeVotedRider ?? (stage ? getStoredVote(stage.id) : null);
  const [results, setResults] = useState<StageResult[] | null>(null);
  const [error, setError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!stage) return;
    fetchResults(stage.id)
      .then(setResults)
      .catch(() => setError(true));
  }, [stage?.id]);

  const totalVotes = results?.reduce((sum, r) => sum + r.totalVotes, 0) ?? 0;

  const top10 = results?.slice(0, 10) ?? [];
  const votedResult = votedRider ? results?.find((r) => r.riderId === votedRider.id) : null;
  const votedInTop10 = votedResult ? top10.some((r) => r.riderId === votedResult.riderId) : true;
  const displayed = votedResult && !votedInTop10 ? [...top10, votedResult] : top10;

  return (
    <>
      <PageView page="tour-etappewinnaar.uitslag" pageTitle="De keuze van het publiek" />
      <Hero >
        {stage && <StageBanner stage={stage} />}
        <h1>
          De keuze van het publiek
        </h1>
        {results && (
          <p className={styles.pickConfirmation}>
            {totalVotes === 1 ? '1 stem uitgebracht' : `${totalVotes} stemmen uitgebracht`}
          </p>
        )}
      </Hero>
      <main className={styles.results}>
        <Link to="/" className={styles.backLink}>
          &larr; Terug naar stemmen
        </Link>
        <Panel title="Meest gekozen renners">
          {(status === 'loading' || (status === 'ready' && !results && !error)) && (
            <p>Laden&hellip;</p>
          )}
          {(status === 'error' || error) && (
            <p>De uitslag kan niet worden geladen. Probeer het later opnieuw.</p>
          )}
          {results && results.length === 0 && <p>Nog geen stemmen voor deze etappe.</p>}
          {results && results.length > 0 && (
            <ol className={styles.resultsList}>
              {displayed.map((result) => {
                const isVoted = result.riderId === votedRider?.id;
                const isExtra = !votedInTop10 && result.riderId === votedResult?.riderId;
                const rank = (results.findIndex((r) => r.riderId === result.riderId) ?? 0) + 1;
                const percentage = Math.round((result.totalVotes / totalVotes) * 100);
                return (
                  <React.Fragment key={result.riderId}>
                    {isExtra && (
                      <li className={styles.resultSeparator} aria-hidden="true">&middot;&middot;&middot;</li>
                    )}
                    <li className={isVoted ? `${styles.resultRow} ${styles.resultRowTop}` : styles.resultRow}>
                      <span className={styles.resultRank}>{rank}</span>
                      <span className={styles.resultInfo}>
                        <span className={styles.resultName}>{result.riderName}</span>
                        <span className={styles.resultTeam}>{result.riderTeam}</span>
                        <span className={styles.resultBarTrack} aria-hidden="true">
                          <span
                            className={styles.resultBar}
                            style={{ width: `${percentage}%` }}
                          />
                        </span>
                        {isVoted && votedRider && stage && (
                          <button
                            className={styles.rowShareButton}
                            onClick={() => setShareOpen(true)}
                            {...clickTracking('Deel jouw keuze')}
                          >
                            Deel jouw keuze
                          </button>
                        )}
                      </span>
                      <span className={styles.resultVotes}>
                        {result.totalVotes === 1 ? '1 stem' : `${result.totalVotes} stemmen`}
                        <span className={styles.resultPercentage}>{percentage}%</span>
                      </span>
                    </li>
                  </React.Fragment>
                );
              })}
            </ol>
          )}
        </Panel>
      </main>
      {shareOpen && votedRider && stage && (
        <ShareDialog rider={votedRider} stage={stage} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}

export { ResultsPage };
