import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleId } from '../types';

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
}

interface AuthState {
  user: TenantProfile | null;
  token: string | null;
  sessionChecked: boolean;
  setAuth: (user: TenantProfile) => void;
  updateProfile: (patch: Partial<TenantProfile>) => void;
  setSessionChecked: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sessionChecked: false,
      setAuth: (user) => set({ user, token: user.token, sessionChecked: true }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      setSessionChecked: (sessionChecked) => set({ sessionChecked }),
      logout: () => set({ user: null, token: null, sessionChecked: true }),
    }),
    { name: 'dora-client-auth' },
  ),
);
