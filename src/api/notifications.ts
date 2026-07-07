import { apiClient, unwrap } from './client';
import type { ApiNotification } from '../types/api';

export const notificationsApi = {
  list: async () => {
    const res = await apiClient.get('/notifications', { params: { limit: 50 } });
    const data = unwrap<{ data: ApiNotification[] }>(res);
    return data.data ?? [];
  },

  markRead: async (id: string) => {
    const res = await apiClient.put(`/notification/read/${id}`);
    return unwrap(res);
  },

  markAllRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    return unwrap<{ modifiedCount: number }>(res);
  },
};
