import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../../components/Hero/Hero';
import { RiderSelect } from '../../components/RiderSelect/RiderSelect';
import { FavoritesToday } from '../../components/FavoritesToday/FavoritesToday';
import { GeneralClassification } from '../../components/GeneralClassification/GeneralClassification';
import { StageBanner } from '../../components/StageBanner/StageBanner';
import { PageView } from '../../components/PageView/PageView';
import { clickTracking } from '../../components/NosTracker/NosTracker';
import { castVote, saveVote, getStoredVote } from '../../api';
import { Rider, Stage } from '../../types';
import { LoadStatus } from '../../App';
import styles from './VotePage.module.css';

type VoteStatus = 'idle' | 'sending' | 'error';

interface VotePageProps {
  status: LoadStatus;
  riders: Rider[];
  stage: Stage | null;
}

function VotePage({ status, riders, stage }: VotePageProps) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>('idle');

  useEffect(() => {
    if (!stage) return;
    const stored = getStoredVote(stage.id);
    if (stored) setSelectedId(stored.id);
  }, [stage?.id]);

  const selectedRider = riders.find((r) => r.id === selectedId);

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    setVoteStatus('idle');
  };

  const handleVote = async () => {
    if (!stage || !selectedId) return;
    setVoteStatus('sending');
    try {
      await castVote(stage.id, selectedId);
      saveVote(stage.id, selectedRider!);
      navigate('/uitslag', { state: { votedRider: selectedRider } });
    } catch {
      setVoteStatus('error');
    }
  };

  return (
    <>
      <PageView page="tour-etappewinnaar.stemmen" pageTitle="Wie wint vandaag de etappe?" />
      <Hero>
        {stage && <StageBanner stage={stage} />}
        <h1>
          Wie wint vandaag de etappe?
        </h1>
        {status === 'loading' && <p className={styles.pickConfirmation}>Laden&hellip;</p>}
        {status === 'error' && (
          <p className={styles.pickConfirmation}>
            De server is niet bereikbaar. Probeer het later opnieuw.
          </p>
        )}
        {status === 'ready' && (
          <>
            <RiderSelect riders={riders} favorites={stage?.favorites} selectedId={selectedId} onSelect={handleSelect} />
            <div className={styles.pickConfirmation} aria-live="polite">
              {!selectedRider && 'Kies je winnaar uit de lijst of klik op een favoriet'}
              {selectedRider && voteStatus === 'idle' && (
                <button
                  className={styles.voteButton}
                  onClick={handleVote}
                  {...clickTracking('Stem bevestigen')}
                >
                  Bevestig keuze: {selectedRider.name}
                </button>
              )}
              {voteStatus === 'sending' && 'Versturen…'}
              {voteStatus === 'error' && 'Stemmen mislukt. Probeer het opnieuw.'}
            </div>
          </>
        )}
      </Hero>
      <main className={styles.columns}>
        <FavoritesToday
          favorites={stage?.favorites ?? []}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <GeneralClassification />
      </main>
    </>
  );
}

export { VotePage };
