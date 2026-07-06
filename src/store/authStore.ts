import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TenantProfile {
  _id: string;
  fullName: string;
  email: string;
  token: string;
  accountType: 'admin' | 'user';
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
  verifyDomain?: string;
  domainTier?: string;
  crmEnabled?: boolean;
  crmTier?: string | null;
  crmSeats?: number;
  campaignStacking?: boolean;
  platformStatus?: string;
}

interface AuthState {
  user: TenantProfile | null;
  token: string | null;
  setAuth: (user: TenantProfile) => void;
  updateProfile: (patch: Partial<TenantProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user) => set({ user, token: user.token }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'dora-client-auth' },
  ),
);
