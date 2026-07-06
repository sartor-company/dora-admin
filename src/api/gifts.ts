import { apiClient, unwrap } from './client';
import type {
  CampaignAnalytics,
  CampaignDetail,
  CampaignListItem,
  CampaignSummary,
  CreateCampaignInput,
  GiftAnalyticsOverview,
  GiftCampaignComparison,
  GiftRedemption,
  GiftTriggerBreakdown,
} from '../types/gifts';

export const giftsApi = {
  listCampaigns: async (params?: { q?: string; status?: string; scope?: string }) => {
    const res = await apiClient.get('/gifts/campaigns', { params });
    return unwrap<{ data: CampaignListItem[] }>(res).data;
  },

  getSummary: async () => {
    const res = await apiClient.get('/gifts/campaigns/summary');
    return unwrap<CampaignSummary>(res);
  },

  getCampaign: async (id: string) => {
    const res = await apiClient.get(`/gifts/campaigns/${id}`);
    return unwrap<CampaignDetail>(res);
  },

  createCampaign: async (body: CreateCampaignInput) => {
    const res = await apiClient.post('/gifts/campaigns', body);
    return unwrap<CampaignDetail>(res);
  },

  pauseCampaign: async (id: string) => {
    const res = await apiClient.post(`/gifts/campaigns/${id}/pause`);
    return unwrap<{ _id: string }>(res);
  },

  endCampaign: async (id: string) => {
    const res = await apiClient.post(`/gifts/campaigns/${id}/end`, { confirm: 'END' });
    return unwrap<{ _id: string }>(res);
  },

  addGiftToPool: async (
    campaignId: string,
    poolId: string,
    body: { name: string; description?: string; totalQty: number; weight?: number },
  ) => {
    const res = await apiClient.post(
      `/gifts/campaigns/${campaignId}/pools/${poolId}/gifts`,
      body,
    );
    return unwrap(res);
  },

  replenishGift: async (
    campaignId: string,
    poolId: string,
    giftId: string,
    body: { quantity: number; notes?: string; releaseToWaitlist?: boolean },
  ) => {
    const res = await apiClient.post(
      `/gifts/campaigns/${campaignId}/pools/${poolId}/gifts/${giftId}/replenish`,
      body,
    );
    return unwrap(res);
  },

  listRedemptions: async (params?: { campaignId?: string; status?: string; q?: string }) => {
    const res = await apiClient.get('/gifts/redemptions', { params });
    return unwrap<{ data: GiftRedemption[] }>(res).data;
  },

  analyticsOverview: async (days = 30) => {
    const res = await apiClient.get('/gifts/analytics/overview', { params: { days } });
    return unwrap<GiftAnalyticsOverview>(res);
  },

  analyticsByTrigger: async (days = 30) => {
    const res = await apiClient.get('/gifts/analytics/by-trigger', { params: { days } });
    return unwrap<{ data: GiftTriggerBreakdown[] }>(res).data;
  },

  analyticsCampaigns: async (days = 30) => {
    const res = await apiClient.get('/gifts/analytics/campaigns', { params: { days } });
    return unwrap<{ data: GiftCampaignComparison[] }>(res).data;
  },

  campaignAnalytics: async (id: string, days = 30) => {
    const res = await apiClient.get(`/gifts/campaigns/${id}/analytics`, { params: { days } });
    return unwrap<CampaignAnalytics>(res);
  },
};
