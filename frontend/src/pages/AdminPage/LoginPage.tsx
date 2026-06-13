import React, { useState } from 'react';
import { adminLogin } from '../../api/admin';
import styles from './AdminPage.module.css';

interface LoginPageProps {
  onLogin: () => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(username, password);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <span className={styles.loginBadge}>Admin</span>
          <h1 className={styles.loginTitle}>Tour Favorieten</h1>
        </div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <label className={styles.label}>
            Gebruikersnaam
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className={styles.label}>
            Wachtwoord
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className={styles.loginError}>{error}</p>}
          <button className={styles.loginButton} type="submit" disabled={loading}>
            {loading ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}

export { LoginPage };
