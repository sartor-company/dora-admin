import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RoleId } from '../types';
import { AUTH_KEY, authStorage } from './authStorage';

export interface NotificationPrefs {
  investigationAlerts: boolean;
  doraTrainingComplete: boolean;
  smsCreditThreshold: boolean;
  pinCreditThreshold: boolean;
  skuRenewalReminders: boolean;
  weeklySummary: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  investigationAlerts: true,
  doraTrainingComplete: true,
  smsCreditThreshold: true,
  pinCreditThreshold: true,
  skuRenewalReminders: true,
  weeklySummary: true,
};

export interface TenantProfile {
  _id: string;
  fullName: string;
  /** Primary contact person (tenant owner settings) */
  contactName?: string;
  /** Staff member display name when accountType is user */
  displayName?: string;
  email: string;
  token: string;
  accountType: 'admin' | 'user';
  consoleRole: RoleId;
  role?: string;
  clientCode?: string;
  rcNumber?: string;
  industry?: string;
  phone?: string;
  address?: string;
  scBand?: 'Pilot' | 'Starter' | 'Growth';
  engagement?: 'pilot' | 'full';
  smsCredits?: number;
  pinCredits?: number;
  batchCalCredits?: number;
  verifyDomain?: string;
  domainTier?: string;
  crmEnabled?: boolean;
  crmTier?: string | null;
  crmSeats?: number;
  campaignStacking?: boolean;
  notificationPrefs?: NotificationPrefs;
  platformStatus?: string;
  pilotDaysRemaining?: number;
  pilotDaysTotal?: number;
  skuCount?: number;
  skuRenewalLabel?: string;
}

interface AuthState {
  user: TenantProfile | null;
  token: string | null;
  rememberMe: boolean;
  sessionChecked: boolean;
  /** Absolute session start (ms) for client-side max age */
  loggedInAt: number | null;
  setAuth: (user: TenantProfile, rememberMe?: boolean) => void;
  updateProfile: (patch: Partial<TenantProfile>) => void;
  setSessionChecked: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rememberMe: false,
      sessionChecked: false,
      loggedInAt: null,
      setAuth: (user, rememberMe = false) =>
        set({
          user,
          token: user.token,
          rememberMe,
          sessionChecked: true,
          loggedInAt: Date.now(),
        }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      setSessionChecked: (sessionChecked) => set({ sessionChecked }),
      logout: () =>
        set({
          user: null,
          token: null,
          rememberMe: false,
          sessionChecked: true,
          loggedInAt: null,
        }),
    }),
    {
      name: AUTH_KEY,
      storage: createJSONStorage(() => authStorage),
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        rememberMe: s.rememberMe,
        loggedInAt: s.loggedInAt,
      }),
    },
  ),
);
