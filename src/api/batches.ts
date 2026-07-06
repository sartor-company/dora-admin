import { apiClient, unwrap } from './client';
import type { ApiBatch } from '../types/api';

export const batchesApi = {
  list: async () => {
    const res = await apiClient.get('/batchs', { params: { limit: 'all' } });
    const data = unwrap<{ data: ApiBatch[] }>(res);
    return data.data ?? [];
  },

  get: async (id: string, includeLabels = false) => {
    const res = await apiClient.get(`/batch/${id}`, {
      params: includeLabels ? { includeLabels: 'true' } : undefined,
    });
    return unwrap<ApiBatch & { labels?: { length: number }[] }>(res);
  },

  create: async (body: {
    manufacturer: string;
    product: string;
    invoiceNumber: string;
    supplier: string;
    batch: Array<{
      quantity: number;
      batchNumber: string;
      expiryDate: number;
      sellingPrice?: number | null;
      supplyPrice?: number | null;
    }>;
  }) => {
    const res = await apiClient.post('/batch', body);
    return unwrap<ApiBatch[]>(res);
  },

  update: async (
    id: string,
    body: { status?: string; quantity?: number; expiryDate?: number },
  ) => {
    const res = await apiClient.put(`/batch/edit/${id}`, body);
    return unwrap<ApiBatch>(res);
  },
};
