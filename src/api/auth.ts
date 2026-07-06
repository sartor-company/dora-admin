import { apiClient, unwrap } from './client';
import type { TenantProfile } from '../store/authStore';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return unwrap<TenantProfile & { accountType: string }>(res);
  },

  getAccount: async () => {
    const res = await apiClient.get('/account');
    return unwrap<TenantProfile>(res);
  },
};
