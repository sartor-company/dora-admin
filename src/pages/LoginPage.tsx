import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../constants/roles';
import { mapLoginToProfile } from '../utils/mapAuth';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (token && user?.consoleRole) {
      navigate(ROLES[user.consoleRole].defaultPath, { replace: true });
    }
  }, [token, user?.consoleRole, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      if (data.accountType !== 'admin' && data.accountType !== 'user') {
        setError('Use your SartorChain client admin account.');
        return;
      }
      const profile = mapLoginToProfile(data);
      setAuth(profile);
      navigate(ROLES[profile.consoleRole].defaultPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-hero" aria-hidden="true">
        <div className="login-hero-bg" />
        <div className="login-hero-overlay" />
        <div className="login-hero-content">
          <div className="login-hero-brand">
            <img className="login-hero-mark brand-logo" src="/sartor-logo.jpg" alt="" width={36} height={36} />
            <span>SARTOR CHAIN</span>
          </div>
          <h1 className="login-hero-title">
            Authenticate products.
            <br />
            Protect your brand.
          </h1>
          <p className="login-hero-sub">
            The client admin console for product authentication, batch management, DORA AI training,
            and consumer verification analytics.
          </p>
          <div className="login-hero-pills">
            <span>Product &amp; batch ops</span>
            <span>DORA AI training</span>
            <span>Gift campaigns</span>
          </div>
        </div>
      </aside>

      <main className="login-panel">
        <div className="login-mobile-brand">
          <img className="login-hero-mark brand-logo" src="/sartor-logo.jpg" alt="" width={32} height={32} />
          <span>SartorChain Client Admin</span>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <p className="login-panel-kicker">CLIENT ADMIN</p>
          <h2 className="login-panel-title">Welcome back</h2>
          <p className="login-panel-sub">
            Sign in as account owner or invited team member (Batch, Brand, or Investigations).
          </p>

          {error && <div className="login-error">{error}</div>}

          <label className="login-field">
            <span>Work email</span>
            <input
              className="login-inp"
              type="email"
              placeholder="admin@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-pw-wrap">
              <input
                className="login-inp"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in to Client Admin'}
          </button>

          <p className="login-footer">
            Need access or forgot your password? Contact your Sartor account manager or{' '}
            <a href="mailto:support@sartor.ng">support@sartor.ng</a>.
          </p>
        </form>
      </main>
    </div>
  );
}
