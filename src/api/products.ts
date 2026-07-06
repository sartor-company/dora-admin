import { apiClient, unwrap } from './client';
import type { ApiProduct } from '../types/api';

export const productsApi = {
  list: async () => {
    const res = await apiClient.get('/products', { params: { limit: 'all' } });
    const data = unwrap<{ data: ApiProduct[] }>(res);
    return data.data ?? [];
  },

  get: async (id: string) => {
    const res = await apiClient.get(`/product/${id}`);
    return unwrap<ApiProduct>(res);
  },

  create: async (body: {
    productName: string;
    manufacturer?: string;
    barcodeNumber?: string;
    description?: string;
  }) => {
    const res = await apiClient.post('/product', body);
    return unwrap<ApiProduct>(res);
  },
};
