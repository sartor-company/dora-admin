import { apiClient, unwrap } from './client';
import type { NotificationPrefs, TenantProfile } from '../store/authStore';

export interface AccountPatch {
  contactName?: string;
  phone?: string;
  address?: string;
  campaignStacking?: boolean;
  notificationPrefs?: Partial<NotificationPrefs>;
}

export type AccountRequestType = 'domain_upgrade' | 'pilot_conversion';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return unwrap<Record<string, unknown> & { accountType: string }>(res);
  },

  getAccount: async () => {
    const res = await apiClient.get('/account');
    return unwrap<TenantProfile>(res);
  },

  patchAccount: async (body: AccountPatch) => {
    const res = await apiClient.patch('/account', body);
    return unwrap<TenantProfile>(res);
  },

  submitRequest: async (body: {
    type: AccountRequestType;
    domainTier?: 'growth' | 'enterprise';
    preferredDomain?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/account/requests', body);
    return unwrap<{ type: AccountRequestType }>(res);
  },

  changePassword: async (passwordOld: string, password1: string, password2: string) => {
    const res = await apiClient.put('/user/password-change', {
      passwordOld,
      password1,
      password2,
    });
    return unwrap(res);
  },
};
