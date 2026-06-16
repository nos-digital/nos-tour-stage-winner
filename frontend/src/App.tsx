import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { VotePage } from './pages/VotePage/VotePage';
import { ResultsPage } from './pages/ResultsPage/ResultsPage';
import { AdminPage } from './pages/AdminPage/AdminPage';
import { NosTracker } from './components/NosTracker/NosTracker';
import { fetchRiders, fetchStages, getActiveStage, todayYMD } from './api';
import { Rider, Stage } from './types';

export type LoadStatus = 'loading' | 'ready' | 'error';

function App() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [riders, setRiders] = useState<Rider[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => {
    Promise.all([fetchRiders(), fetchStages()])
      .then(([loadedRiders, stages]) => {
        setRiders(loadedRiders);
        setStage(getActiveStage(stages, todayYMD()));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <NosTracker />
        <Routes>
          <Route path="/" element={<VotePage status={status} riders={riders} stage={stage} />} />
          <Route path="/uitslag" element={<ResultsPage status={status} stage={stage} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
