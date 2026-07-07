import { apiClient, unwrap } from './client';

export interface InvestigationRow {
  id: string;
  _id: string;
  displayId: string;
  priority: string;
  priorityColor: string;
  flag: string;
  flagVariant: string;
  batch: string;
  product: string;
  dora: number;
  status: string;
  statusVariant: string;
  location: string;
  description?: string;
  desc?: string;
  opened?: string;
  closed?: string;
  officer?: string;
  outcome?: string;
  outcomeVariant?: string;
  [key: string]: string | number | undefined;
}

export interface InvestigationStats {
  queue: number;
  p1: number;
  p2: number;
  closed: number;
  avgResolutionDays: number | null;
}

export const investigationsApi = {
  list: async (status?: string) => {
    const res = await apiClient.get('/investigations', { params: status ? { status } : {} });
    const data = unwrap<{ data: InvestigationRow[]; kpis?: InvestigationStats }>(res);
    return { rows: data.data ?? [], kpis: data.kpis };
  },

  stats: async () => {
    const res = await apiClient.get('/investigations/stats');
    return unwrap<InvestigationStats>(res);
  },

  get: async (id: string) => {
    const res = await apiClient.get(`/investigations/${id}`);
    return unwrap<InvestigationRow>(res);
  },

  create: async (body: {
    batch?: string;
    batchId?: string;
    product?: string;
    description: string;
    severity?: 'P1' | 'P2' | 'P3';
    location?: string;
    doraScore?: number;
  }) => {
    const res = await apiClient.post('/investigations', body);
    return unwrap<InvestigationRow>(res);
  },

  addNote: async (id: string, note: string) => {
    const res = await apiClient.patch(`/investigations/${id}`, { note });
    return unwrap<InvestigationRow>(res);
  },

  clearFalsePositive: async (id: string, body: { reason: string; notes?: string }) => {
    const res = await apiClient.post(`/investigations/${id}/clear-fp`, body);
    return unwrap<InvestigationRow>(res);
  },

  generateEvidenceBundle: async (id: string, recipient: string) => {
    const res = await apiClient.post(`/investigations/${id}/evidence-bundle`, { recipient });
    return unwrap<{
      bundleId: string;
      investigationId: string;
      recipient: string;
      emailedTo?: string | null;
    }>(res);
  },
};
