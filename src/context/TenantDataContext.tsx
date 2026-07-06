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
import { batchesApi } from '../api/batches';
import { billingApi } from '../api/billing';
import type { PlatformInvoice } from '../api/billing';
import { notificationsApi } from '../api/notifications';
import { productsApi } from '../api/products';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { analyticsApi } from '../api/analytics';
import { giftsApi } from '../api/gifts';
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
  refreshAll: () => Promise<void>;
  refreshAccount: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [doraUploadTarget, setDoraUploadTarget] = useState<DoraUploadTarget | null>(null);

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

  const refreshAccount = useCallback(async () => {
    const profile = await authApi.getAccount();
    updateProfile({ ...profile, token: useAuthStore.getState().token! });
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
        refreshAccount(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [refreshProducts, refreshBatches, refreshNotifications, refreshTeam, refreshInvoices, refreshAnalytics, refreshCampaigns, refreshAccount]);

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
    }
  }, [token, refreshAll]);

  const productRows = useMemo(() => products.map(productDisplayRow), [products]);
  const batchRows = useMemo(() => batches.map(batchDisplayRow), [batches]);

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
      refreshAll,
      refreshAccount,
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
      loading,
      doraUploadTarget,
      refreshProducts,
      refreshBatches,
      refreshNotifications,
      refreshTeam,
      refreshInvoices,
      refreshAnalytics,
      refreshCampaigns,
      refreshAll,
      refreshAccount,
    ],
  );

  return <TenantDataContext.Provider value={value}>{children}</TenantDataContext.Provider>;
}

export function useTenantData() {
  const ctx = useContext(TenantDataContext);
  if (!ctx) throw new Error('useTenantData must be used within TenantDataProvider');
  return ctx;
}
