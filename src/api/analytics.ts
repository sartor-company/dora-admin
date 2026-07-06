import { apiClient, unwrap } from './client';
import type {
  AnalyticsOverview,
  BatchAnalytics,
  FraudAnalytics,
  GeoAnalytics,
  LoyaltyAnalytics,
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
};
