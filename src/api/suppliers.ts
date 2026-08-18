import { apiClient, unwrap } from './client';
import type { ApiSupplier } from '../types/api';

export const suppliersApi = {
  list: async () => {
    const res = await apiClient.get('/suppliers', { params: { limit: 'all' } });
    const data = unwrap<{ data: ApiSupplier[] }>(res);
    return data.data ?? [];
  },

  create: async (body: { name: string; email: string; phone?: string }) => {
    const res = await apiClient.post('/supplier', body);
    return unwrap<ApiSupplier>(res);
  },
};
