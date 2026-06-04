import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import { legacyPageToPath } from '../constants/routes';
import type { ClientType, CurrencyCode, RoleId } from '../types';

interface AppContextValue {
  role: RoleId;
  setRole: (role: RoleId) => void;
  clientType: ClientType;
  setClientType: (type: ClientType) => void;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  isReadOnly: boolean;
  clientName: string;
  companyName: string;
  navigateTo: (path: string) => void;
  navigateLegacy: (pageId: string) => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [role, setRoleState] = useState<RoleId>('owner');
  const [clientType, setClientType] = useState<ClientType>('full');
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isReadOnly = role === 'brand' || role === 'inv';

  const clientName =
    clientType === 'pilot' ? 'FreshNow Consumer (Pilot)' : 'Sartor Health Co. Ltd';

  const companyName = 'Sartor Health Co. Ltd';

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

  const navigateLegacy = useCallback(
    (pageId: string) => navigateTo(legacyPageToPath(pageId)),
    [navigateTo],
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      clientType,
      setClientType,
      currency,
      setCurrency,
      isReadOnly,
      clientName,
      companyName,
      navigateTo,
      navigateLegacy,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
    }),
    [
      role,
      setRole,
      clientType,
      currency,
      isReadOnly,
      clientName,
      companyName,
      navigateTo,
      navigateLegacy,
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
