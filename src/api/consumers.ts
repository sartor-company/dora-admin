import { apiClient, unwrap } from './client';
import type {
  ConsumerDetail,
  ConsumerDirectoryResponse,
  ConsumerExportPayload,
} from '../types/consumers';

export type ConsumerListParams = {
  q?: string;
  status?: string;
  filter?: string;
  reveal?: boolean;
};

export const consumersApi = {
  list: async (params?: ConsumerListParams) => {
    const res = await apiClient.get('/consumers', {
      params: {
        q: params?.q || undefined,
        status: params?.status || undefined,
        filter: params?.filter || undefined,
        reveal: params?.reveal ? '1' : undefined,
      },
    });
    return unwrap<ConsumerDirectoryResponse>(res);
  },

  get: async (id: string, reveal = false) => {
    const res = await apiClient.get(`/consumers/${id}`, {
      params: reveal ? { reveal: '1' } : undefined,
    });
    return unwrap<ConsumerDetail>(res);
  },

  revealPii: async (reason?: string) => {
    const res = await apiClient.post('/consumers/reveal-pii', { reason });
    return unwrap<{ revealed: boolean; at: number }>(res);
  },

  export: async (body?: {
    ids?: string[];
    q?: string;
    status?: string;
    filter?: string;
    reveal?: boolean;
  }) => {
    const res = await apiClient.post('/consumers/export', body || {});
    return unwrap<ConsumerExportPayload>(res);
  },
};
