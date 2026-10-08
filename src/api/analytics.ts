import { apiClient, unwrap } from './client';
import type {
  AnalyticsOverview,
  BatchAnalytics,
  FraudAnalytics,
  GeoAnalytics,
  LoyaltyAnalytics,
  ScanSessionsResponse,
} from '../types/analytics';

export const analyticsApi = {
  overview: async (days = 30) => {
    const res = await apiClient.get('/analytics/overview', { params: { days } });
    return unwrap<AnalyticsOverview>(res);
  },

  batch: async (id: string, days = 30) => {
    const res = await apiClient.get(`/analytics/batch/${id}`, { params: { days } });
    return unwrap<BatchAnalytics>(res);
  },

  fraud: async (days = 30) => {
    const res = await apiClient.get('/analytics/fraud', { params: { days } });
    return unwrap<FraudAnalytics>(res);
  },

  loyalty: async (days = 30) => {
    const res = await apiClient.get('/analytics/loyalty', { params: { days } });
    return unwrap<LoyaltyAnalytics>(res);
  },

  geo: async (days = 30) => {
    const res = await apiClient.get('/analytics/geo', { params: { days } });
    return unwrap<GeoAnalytics>(res);
  },

  productReports: async (search: string) => {
    const res = await apiClient.get('/analytics/product-reports', { params: { search } });
    return unwrap<{
      reports: {
        id: string;
        ticketId: string;
        sessionId: string | null;
        productName?: string;
        batchNumber?: string;
        pin: string | null;
        pinResult: string | null;
        doraScore: number | null;
        latitude: number | null;
        longitude: number | null;
        storeName?: string;
        storeLocation?: string;
        issueType?: string;
        status?: string;
        createdAt?: string;
      }[];
    }>(res);
  },

  scanSessions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    stage?: number | string;
    search?: string;
  }) => {
    const res = await apiClient.get('/analytics/scan-sessions', { params });
    return unwrap<ScanSessionsResponse>(res);
  },
};

