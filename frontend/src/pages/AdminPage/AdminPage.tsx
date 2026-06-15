import React, { useEffect, useState } from 'react';
import { clearToken } from '../../api/admin';
import { updateFavorites } from '../../api/admin';
import { fetchStages, fetchRiders } from '../../api';
import { Rider, Stage } from '../../types';
import { LoginPage } from './LoginPage';
import { getToken } from '../../api/admin';
import styles from './AdminPage.module.css';

function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [stages, setStages] = useState<Stage[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [favorites, setFavorites] = useState<Rider[]>([]);
  const [search, setSearch] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!loggedIn) return;
    Promise.all([fetchStages(), fetchRiders()]).then(([s, r]) => {
      setStages(s);
      setRiders(r);
    });
  }, [loggedIn]);

  const selectStage = (stage: Stage) => {
    setSelectedStage(stage);
    setFavorites(stage.favorites ?? []);
    setSearch('');
    setSaveStatus('idle');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...favorites];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setFavorites(updated);
    setSaveStatus('idle');
  };

  const moveDown = (index: number) => {
    if (index === favorites.length - 1) return;
    const updated = [...favorites];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setFavorites(updated);
    setSaveStatus('idle');
  };

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter((r) => r.id !== id));
    setSaveStatus('idle');
  };

  const addFavorite = (rider: Rider) => {
    if (favorites.some((r) => r.id === rider.id)) return;
    setFavorites([...favorites, rider]);
    setSearch('');
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!selectedStage) return;
    setSaveStatus('saving');
    try {
      await updateFavorites(selectedStage.id, favorites.map((r) => r.id));
      setSaveStatus('saved');
      setStages(stages.map((s) =>
        s.id === selectedStage.id ? { ...s, favorites } : s
      ));
    } catch (err: any) {
      setSaveStatus('error');
      if (err.message.includes('Sessie')) {
        setLoggedIn(false);
      }
    }
  };

  const handleLogout = () => {
    clearToken();
    setLoggedIn(false);
  };

  const favoriteIds = new Set(favorites.map((r) => r.id));
  const suggestions = search.length >= 2
    ? riders
        .filter((r) => !r.outOfRace && !favoriteIds.has(r.id))
        .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 8)
    : [];

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className={styles.adminWrap}>
      <header className={styles.adminHeader}>
        <div className={styles.adminHeaderInner}>
          <div className={styles.adminHeaderTitle}>
            <span className={styles.loginBadge}>Admin</span>
            <span>Tour Favorieten Beheer</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Uitloggen
          </button>
        </div>
      </header>

      <div className={styles.adminBody}>
        <aside className={styles.stageList}>
          <h2 className={styles.sidebarTitle}>Etappes</h2>
          {stages.map((stage) => (
            <button
              key={stage.id}
              className={stage.id === selectedStage?.id ? `${styles.stageItem} ${styles.stageItemActive}` : styles.stageItem}
              onClick={() => selectStage(stage)}
            >
              <span className={styles.stageNum}>E{stage.number}</span>
              <span className={styles.stageInfo}>
                <span className={styles.stageRoute}>{stage.start} → {stage.finish}</span>
                <span className={styles.stageMeta}>{stage.distanceKm} km · {stage.stageType}</span>
              </span>
              <span className={styles.stageFavCount}>{(stage.favorites ?? []).length}</span>
            </button>
          ))}
        </aside>

        <main className={styles.editor}>
          {!selectedStage && (
            <p className={styles.placeholder}>← Selecteer een etappe om favorieten te beheren</p>
          )}
          {selectedStage && (
            <>
              <div className={styles.editorHeader}>
                <h2 className={styles.editorTitle}>
                  Etappe {selectedStage.number} — {selectedStage.start} → {selectedStage.finish}
                </h2>
                <p className={styles.editorMeta}>
                  {selectedStage.distanceKm} km · {selectedStage.stageType} · {selectedStage.date}
                </p>
              </div>

              <div className={styles.favoritesList}>
                {favorites.length === 0 && (
                  <p className={styles.emptyState}>Nog geen favorieten voor deze etappe.</p>
                )}
                {favorites.map((rider, index) => (
                  <div key={rider.id} className={styles.favoriteRow}>
                    <span className={styles.favoritePos}>{index + 1}</span>
                    <span className={styles.favoriteInfo}>
                      <span className={styles.favoriteName}>{rider.name}</span>
                      <span className={styles.favoriteTeam}>{rider.team || '—'}</span>
                    </span>
                    <div className={styles.favoriteActions}>
                      <button className={styles.iconButton} onClick={() => moveUp(index)} disabled={index === 0} title="Omhoog">↑</button>
                      <button className={styles.iconButton} onClick={() => moveDown(index)} disabled={index === favorites.length - 1} title="Omlaag">↓</button>
                      <button className={styles.iconButtonRemove} onClick={() => removeFavorite(rider.id)} title="Verwijderen">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.addSection}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Renner zoeken…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <ul className={styles.suggestions}>
                    {suggestions.map((rider) => (
                      <li key={rider.id}>
                        <button className={styles.suggestionItem} onClick={() => addFavorite(rider)}>
                          <span className={styles.favoriteName}>{rider.name}</span>
                          <span className={styles.favoriteTeam}>{rider.team}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.saveRow}>
                <button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Opslaan…' : 'Opslaan'}
                </button>
                {saveStatus === 'saved' && <span className={styles.saveSuccess}>✓ Opgeslagen</span>}
                {saveStatus === 'error' && <span className={styles.saveError}>Opslaan mislukt</span>}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export { AdminPage };
