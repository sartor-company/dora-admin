import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { mapLoginToProfile } from '../utils/mapAuth';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);
  const [checking, setChecking] = useState(!sessionChecked && Boolean(token));

  useEffect(() => {
    if (!token) {
      setSessionChecked(true);
      return;
    }
    if (sessionChecked) return;

    let cancelled = false;
    (async () => {
      try {
        const account = await authApi.getAccount();
        const existing = useAuthStore.getState().user;
        const merged = mapLoginToProfile({
          ...account,
          accountType: existing?.accountType ?? 'admin',
          consoleRole: existing?.consoleRole,
          token: token!,
          tenantName: existing?.fullName,
        } as Record<string, unknown>);
        if (!cancelled) setAuth({ ...merged, token: token! });
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) {
          setSessionChecked(true);
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, sessionChecked, setAuth, logout, setSessionChecked]);

  if (!token) return <Navigate to="/login" replace />;
  if (checking) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text3)' }}>
        Validating session…
      </div>
    );
  }
  return <Outlet />;
}
