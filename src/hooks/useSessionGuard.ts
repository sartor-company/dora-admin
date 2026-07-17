import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { notifySessionExpired } from '../utils/appFeedback';

/** Idle timeout — logout if no interaction */
const IDLE_MS = 3 * 60 * 60 * 1000; // 3 hours
/** Absolute max session from login (aligns with typical SESSION_MAX_AGE_HOURS) */
const ABSOLUTE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useSessionGuard() {
  const token = useAuthStore((s) => s.token);
  const loggedInAt = useAuthStore((s) => s.loggedInAt);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    const forceLogout = () => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      notifySessionExpired('Your session has expired due to inactivity. Please sign in again.');
      logout();
      window.setTimeout(() => {
        navigate('/login?session=expired', { replace: true });
      }, 1200);
    };

    const absoluteExpired = () => {
      const started = loggedInAt || 0;
      if (!started) return true;
      return Date.now() - started >= ABSOLUTE_MS;
    };

    if (absoluteExpired()) {
      forceLogout();
      return;
    }

    const enforceIdleLimit = () => {
      if (absoluteExpired() || Date.now() - lastActivityRef.current >= IDLE_MS) {
        forceLogout();
        return true;
      }
      return false;
    };

    const reset = () => {
      if (enforceIdleLimit()) return;
      lastActivityRef.current = Date.now();
      if (timerRef.current) clearTimeout(timerRef.current);
      const untilAbsolute = ABSOLUTE_MS - (Date.now() - (loggedInAt || Date.now()));
      const delay = Math.max(1000, Math.min(IDLE_MS, untilAbsolute));
      timerRef.current = setTimeout(() => {
        forceLogout();
      }, delay);
    };

    const handleVisibilityOrFocus = () => {
      if (enforceIdleLimit()) return;
      reset();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, reset));
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [token, loggedInAt, logout, navigate]);
}
