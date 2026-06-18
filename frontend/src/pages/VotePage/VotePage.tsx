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
  const [storedVote, setStoredVote] = useState<Rider | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!stage) return;
    const stored = getStoredVote(stage.id);
    setStoredVote(stored);
    setSelectedId(stored ? stored.id : null);
    setEditing(false);
  }, [stage?.id]);

  const selectedRider = riders.find((r) => r.id === selectedId);
  // Once a stage starts, voting closes — the page becomes a "live, view results" screen.
  const votingClosed = !!stage?.started;
  // A returning voter sees a "view results" screen unless they choose to edit.
  const showVoteForm = !votingClosed && (!storedVote || editing);

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
      <PageView page="tour-etappewinnaar.stemmen" pageTitle="Wie wint de etappe?" />
      <Hero>
        {stage && <StageBanner stage={stage} />}
        <h1>
          {stage ? `Wie wint etappe ${stage.number}?` : 'Wie wint de etappe?'}
        </h1>
        {status === 'loading' && <p className={styles.pickConfirmation}>Laden&hellip;</p>}
        {status === 'error' && (
          <p className={styles.pickConfirmation}>
            De server is niet bereikbaar. Probeer het later opnieuw.
          </p>
        )}
        {status === 'ready' && showVoteForm && (
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
        {status === 'ready' && votingClosed && (
          <div className={styles.votedBox} aria-live="polite">
            <p className={styles.votedText}>
              {stage?.finished
                ? 'Deze etappe is afgelopen.'
                : 'Deze etappe is bezig — stemmen is gesloten.'}
            </p>
            <button
              className={styles.voteButton}
              onClick={() => navigate('/uitslag', { state: { votedRider: storedVote } })}
              {...clickTracking('Naar uitslag')}
            >
              Bekijk de uitslag
            </button>
          </div>
        )}
        {status === 'ready' && !votingClosed && !showVoteForm && (
          <div className={styles.votedBox} aria-live="polite">
            <p className={styles.votedText}>
              Je stemde op <strong>{storedVote!.name}</strong>
            </p>
            <button
              className={styles.voteButton}
              onClick={() => navigate('/uitslag', { state: { votedRider: storedVote } })}
              {...clickTracking('Naar uitslag')}
            >
              Bekijk de uitslag
            </button>
            <button
              type="button"
              className={styles.changeLink}
              onClick={() => setEditing(true)}
              {...clickTracking('Wijzig stem')}
            >
              Toch van gedachten veranderd? Wijzig je keuze
            </button>
          </div>
        )}
      </Hero>
      <main className={styles.single}>
        {showVoteForm && (
          <FavoritesToday
            favorites={stage?.favorites ?? []}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}
        <GeneralClassification
          selectedId={selectedId}
          onSelect={showVoteForm ? handleSelect : undefined}
        />
      </main>
    </>
  );
}

export { VotePage };
