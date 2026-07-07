import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import { legacyPageToPath } from '../constants/routes';
import { useAuthStore } from '../store/authStore';
import type { ClientType, CurrencyCode, RoleId } from '../types';

interface AppContextValue {
  role: RoleId;
  setRole: (role: RoleId) => void;
  displayUser: string;
  clientType: ClientType;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  isReadOnly: boolean;
  clientName: string;
  companyName: string;
  crmEnabled: boolean;
  verifyDomain: string;
  scBand: string;
  smsCredits: number;
  pinCredits: number;
  batchCalCredits: number;
  logout: () => void;
  navigateTo: (path: string) => void;
  navigateLegacy: (pageId: string) => void;
  navigateWithQuery: (path: string, params: Record<string, string>) => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const [role, setRoleState] = useState<RoleId>(user?.consoleRole ?? 'owner');
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.consoleRole) setRoleState(user.consoleRole);
  }, [user?.consoleRole]);

  const isReadOnly = role === 'brand' || role === 'inv';
  const clientType: ClientType = user?.engagement === 'pilot' ? 'pilot' : 'full';
  const companyName = user?.fullName || 'Sartor Client';
  const displayUser = user?.displayName || ROLES[role].user;
  const clientName =
    clientType === 'pilot' ? `${companyName} (Pilot)` : companyName;

  const setRole = useCallback(
    (next: RoleId) => {
      setRoleState(next);
      navigate(ROLES[next].defaultPath);
      setSidebarOpen(false);
    },
    [navigate],
  );

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
      setSidebarOpen(false);
    },
    [navigate],
  );

  const navigateWithQuery = useCallback(
    (path: string, params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      navigate(qs ? `${path}?${qs}` : path);
      setSidebarOpen(false);
    },
    [navigate],
  );

  const navigateLegacy = useCallback(
    (pageId: string) => navigateTo(legacyPageToPath(pageId)),
    [navigateTo],
  );

  const logout = useCallback(() => {
    logoutStore();
    navigate('/login');
  }, [logoutStore, navigate]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      displayUser,
      clientType,
      currency,
      setCurrency,
      isReadOnly,
      clientName,
      companyName,
      crmEnabled: Boolean(user?.crmEnabled),
      verifyDomain: user?.verifyDomain || 'verify.dorascan.ai',
      scBand: user?.scBand || 'Pilot',
      smsCredits: user?.smsCredits ?? 0,
      pinCredits: user?.pinCredits ?? 0,
      batchCalCredits: user?.batchCalCredits ?? 18,
      logout,
      navigateTo,
      navigateLegacy,
      navigateWithQuery,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
    }),
    [
      role,
      setRole,
      displayUser,
      clientType,
      currency,
      isReadOnly,
      clientName,
      companyName,
      user,
      logout,
      navigateTo,
      navigateLegacy,
      navigateWithQuery,
      sidebarOpen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
