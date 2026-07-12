import type { StateStorage } from 'zustand/middleware';

const AUTH_KEY = 'dora-client-auth';
const REMEMBERED_EMAIL_KEY = 'dora-client-remembered-email';

/** Prefer session (tab) storage; fall back to localStorage for “Remember me”. */
export const authStorage: StateStorage = {
  getItem: (name) => {
    return sessionStorage.getItem(name) ?? localStorage.getItem(name);
  },
  setItem: (name, value) => {
    try {
      const parsed = JSON.parse(value) as {
        state?: { rememberMe?: boolean; user?: unknown };
      };
      const hasUser = Boolean(parsed?.state?.user);
      const remember = Boolean(parsed?.state?.rememberMe);

      if (!hasUser) {
        localStorage.removeItem(name);
        sessionStorage.setItem(name, value);
        return;
      }

      if (remember) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export function getRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

export function setRememberedEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export { AUTH_KEY };
