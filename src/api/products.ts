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
    productCategory?: string;
    doraCategory?: string;
    sizeVolume?: string;
    skuLabelName?: string;
    labelConfig?: '2sided' | '1sided' | '6sided';
  }) => {
    const res = await apiClient.post('/product', body);
    return unwrap<ApiProduct>(res);
  },

  update: async (
    id: string,
    body: {
      productName?: string;
      manufacturer?: string;
      barcodeNumber?: string;
      description?: string;
      status?: string;
      productCategory?: string;
      doraCategory?: string;
      sizeVolume?: string;
      skuLabelName?: string;
      labelConfig?: '2sided' | '1sided' | '6sided';
    },
  ) => {
    const res = await apiClient.put(`/product/edit/${id}`, body);
    return unwrap<ApiProduct>(res);
  },
};
