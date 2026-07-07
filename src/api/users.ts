import { apiClient, unwrap } from './client';
import type { ApiTeamMember } from '../types/api';

export const usersApi = {
  list: async () => {
    const res = await apiClient.get('/users', { params: { limit: 'all' } });
    const data = unwrap<{ data: ApiTeamMember[] }>(res);
    return data.data ?? [];
  },

  invite: async (body: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    consoleRole?: 'batch' | 'brand' | 'inv';
  }) => {
    const res = await apiClient.post('/user/create', body);
    return unwrap<ApiTeamMember>(res);
  },

  update: async (
    id: string,
    body: {
      fullName?: string;
      phone?: string;
      consoleRole?: 'batch' | 'brand' | 'inv';
      blocked?: boolean;
    },
  ) => {
    const res = await apiClient.patch(`/user/team/${id}`, body);
    return unwrap<ApiTeamMember>(res);
  },

  getProfile: async () => {
    const res = await apiClient.get('/user/details');
    return unwrap<ApiTeamMember & { notificationPrefs?: Record<string, boolean> }>(res);
  },

  updateProfile: async (
    id: string,
    body: {
      fullName?: string;
      phone?: string;
      notificationPrefs?: Record<string, boolean>;
    },
  ) => {
    const res = await apiClient.put('/user/edit', { id, ...body });
    return unwrap<ApiTeamMember & { notificationPrefs?: Record<string, boolean> }>(res);
  },
};
