import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth';
import { mapAccountToProfile } from '../utils/mapAuth';
import { batchesApi } from '../api/batches';
import { billingApi } from '../api/billing';
import type { PlatformInvoice } from '../api/billing';
import { notificationsApi } from '../api/notifications';
import { productsApi } from '../api/products';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { analyticsApi } from '../api/analytics';
import { giftsApi } from '../api/gifts';
import { investigationsApi, type InvestigationRow, type InvestigationStats } from '../api/investigations';
import type { AnalyticsOverview } from '../types/analytics';
import type { CampaignListItem, CampaignSummary } from '../types/gifts';
import type { ApiBatch, ApiNotification, ApiProduct, ApiTeamMember } from '../types/api';
import { batchDisplayRow, productDisplayRow, type BatchRow, type ProductRow } from '../utils/mappers';

export interface DoraUploadTarget {
  batchId: string;
  productId: string;
  batchNumber: string;
  productName: string;
}

interface TenantDataContextValue {
  products: ApiProduct[];
  productRows: ProductRow[];
  batches: ApiBatch[];
  batchRows: BatchRow[];
  notifications: ApiNotification[];
  team: ApiTeamMember[];
  invoices: PlatformInvoice[];
  analytics: AnalyticsOverview | null;
  campaigns: CampaignListItem[];
  campaignSummary: CampaignSummary | null;
  investigations: InvestigationRow[];
  investigationStats: InvestigationStats | null;
  navBadges: { fraud?: number; investigations?: number; notifications?: number };
  loading: boolean;
  doraUploadTarget: DoraUploadTarget | null;
  setDoraUploadTarget: (target: DoraUploadTarget | null) => void;
  refreshProducts: () => Promise<void>;
  refreshBatches: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshTeam: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshCampaigns: () => Promise<void>;
  refreshInvestigations: () => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  giftModalNonce: number;
  notifyGiftChange: () => void;
}

const TenantDataContext = createContext<TenantDataContextValue | null>(null);

export function TenantDataProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [team, setTeam] = useState<ApiTeamMember[]>([]);
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary | null>(null);
  const [investigations, setInvestigations] = useState<InvestigationRow[]>([]);
  const [investigationStats, setInvestigationStats] = useState<InvestigationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [doraUploadTarget, setDoraUploadTarget] = useState<DoraUploadTarget | null>(null);
  const [giftModalNonce, setGiftModalNonce] = useState(0);
  const notifyGiftChange = useCallback(() => setGiftModalNonce((n) => n + 1), []);

  const refreshProducts = useCallback(async () => {
    const list = await productsApi.list();
    setProducts(list);
  }, []);

  const refreshBatches = useCallback(async () => {
    const list = await batchesApi.list();
    setBatches(list);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const list = await notificationsApi.list();
    setNotifications(list);
  }, []);

  const refreshTeam = useCallback(async () => {
    const list = await usersApi.list();
    setTeam(list);
  }, []);

  const refreshInvoices = useCallback(async () => {
    const list = await billingApi.listInvoices();
    setInvoices(list);
  }, []);

  const refreshAnalytics = useCallback(async () => {
    const data = await analyticsApi.overview(30);
    setAnalytics(data);
  }, []);

  const refreshCampaigns = useCallback(async () => {
    const [list, summary] = await Promise.all([
      giftsApi.listCampaigns(),
      giftsApi.getSummary(),
    ]);
    setCampaigns(list);
    setCampaignSummary(summary);
  }, []);

  const refreshInvestigations = useCallback(async () => {
    const { rows, kpis } = await investigationsApi.list();
    setInvestigations(rows);
    if (kpis) setInvestigationStats(kpis);
    else setInvestigationStats(await investigationsApi.stats());
  }, []);

  const refreshAccount = useCallback(async () => {
    const profile = await authApi.getAccount();
    const token = useAuthStore.getState().token;
    if (token) {
      updateProfile(mapAccountToProfile(profile as unknown as Record<string, unknown>, token));
    }
  }, [updateProfile]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        refreshProducts(),
        refreshBatches(),
        refreshNotifications(),
        refreshTeam(),
        refreshInvoices(),
        refreshAnalytics(),
        refreshCampaigns(),
        refreshInvestigations(),
        refreshAccount(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [refreshProducts, refreshBatches, refreshNotifications, refreshTeam, refreshInvoices, refreshAnalytics, refreshCampaigns, refreshInvestigations, refreshAccount]);

  useEffect(() => {
    if (token) refreshAll();
    else {
      setProducts([]);
      setBatches([]);
      setNotifications([]);
      setTeam([]);
      setInvoices([]);
      setAnalytics(null);
      setCampaigns([]);
      setCampaignSummary(null);
      setInvestigations([]);
      setInvestigationStats(null);
    }
  }, [token, refreshAll]);

  const productRows = useMemo(() => {
    const statsById = Object.fromEntries(
      (analytics?.topProducts ?? []).map((p) => [p.productId, p]),
    );
    return products.map((p) => {
      const s = statsById[p._id];
      return productDisplayRow(
        p,
        s ? { scans: s.scans, authRate: s.authRate } : undefined,
      );
    });
  }, [products, analytics]);
  const batchRows = useMemo(() => batches.map((b) => batchDisplayRow(b)), [batches]);
  const navBadges = useMemo(() => {
    const unread = notifications.filter((n) => !n.status).length;
    const fraud = analytics?.kpis.fraudAlerts ?? 0;
    const invQueue = investigationStats?.queue ?? 0;
    return {
      fraud: fraud > 0 ? fraud : undefined,
      investigations: invQueue > 0 ? invQueue : undefined,
      notifications: unread > 0 ? unread : undefined,
    };
  }, [analytics, investigationStats, notifications]);

  const value = useMemo(
    () => ({
      products,
      productRows,
      batches,
      batchRows,
      notifications,
      team,
      invoices,
      analytics,
      campaigns,
      campaignSummary,
      investigations,
      investigationStats,
      navBadges,
      loading,
      doraUploadTarget,
      setDoraUploadTarget,
      refreshProducts,
      refreshBatches,
      refreshNotifications,
      refreshTeam,
      refreshInvoices,
      refreshAnalytics,
      refreshCampaigns,
      refreshInvestigations,
      refreshAll,
      refreshAccount,
      giftModalNonce,
      notifyGiftChange,
    }),
    [
      products,
      productRows,
      batches,
      batchRows,
      notifications,
      team,
      invoices,
      analytics,
      campaigns,
      campaignSummary,
      investigations,
      investigationStats,
      navBadges,
      loading,
      doraUploadTarget,
      refreshProducts,
      refreshBatches,
      refreshNotifications,
      refreshTeam,
      refreshInvoices,
      refreshAnalytics,
      refreshCampaigns,
      refreshInvestigations,
      refreshAll,
      refreshAccount,
      giftModalNonce,
      notifyGiftChange,
    ],
  );

  return <TenantDataContext.Provider value={value}>{children}</TenantDataContext.Provider>;
}

export function useTenantData() {
  const ctx = useContext(TenantDataContext);
  if (!ctx) throw new Error('useTenantData must be used within TenantDataProvider');
  return ctx;
}
