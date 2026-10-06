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
  dora: number | null;
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
  [key: string]: string | number | null | undefined;
}

/** Customer-facing lifecycle (derived server-side from status + outcome) */
export type InvestigationLifecycle = 'Open' | 'False Positive' | 'Closed' | 'Counterfeit Confirmed';
export const INVESTIGATION_LIFECYCLES: InvestigationLifecycle[] = ['Open', 'False Positive', 'Closed', 'Counterfeit Confirmed'];

export interface TelemetrySession {
  key: string;
  sessionId: string | null;
  caseRef: string;
  triggers: { trigger: 'PIN_LOCKOUT' | 'MANUAL' | 'REPORT'; by: string | null; at: number | null }[];
  status: string | null;
  lockReason: string | null;
  createdAt: string | null;
  dorascan: { score: number; verdict: 'Consistent' | 'Uncertain' | 'Suspicious' } | null;
  pin: {
    result: string | null;
    verifiedPin: string | null;
    failedCount: number;
    attempts: { pin: string; resultCode: string; at: string }[];
  };
  location: { gps: { lat: number; lng: number } | null; storeName: string | null; storeAddress: string | null };
  customer: { source: 'report' | 'account'; name: string | null; phone: string | null; email: string | null } | null;
  photos: { slot: string; url: string; ticketId: string }[];
  reports: { ticketId: string; issueType: string; notes: string; storeName: string; storeAddress: string; at: string | null }[];
  reportCount: number;
}

export interface InvestigationTelemetry {
  investigationId: string;
  lifecycle: InvestigationLifecycle;
  revealed: boolean;
  sessions: TelemetrySession[];
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

  /** Per-session telemetry. `reveal` unmasks customer contact and is audit-logged server-side. */
  telemetry: async (id: string, reveal = false) => {
    const res = await apiClient.get(`/investigations/${encodeURIComponent(id)}/telemetry`, {
      params: reveal ? { reveal: 1 } : {},
    });
    return unwrap<InvestigationTelemetry>(res);
  },

  /** Owner / Investigation Officer: change lifecycle; every customer on the case is emailed. */
  setLifecycle: async (id: string, lifecycle: InvestigationLifecycle, reason?: string) => {
    const res = await apiClient.post(`/investigations/${encodeURIComponent(id)}/lifecycle`, { lifecycle, reason });
    return unwrap<InvestigationRow & { customersNotified: boolean }>(res);
  },

  create: async (body: {
    batch?: string;
    batchId?: string;
    product?: string;
    description: string;
    severity?: 'P1' | 'P2' | 'P3';
    location?: string;
    doraScore?: number | null;
    patternType?: string;
  }) => {
    const res = await apiClient.post('/investigations', body);
    return unwrap<InvestigationRow>(res);
  },

  /** Promote a failed Stage 2 PIN scan session to an investigation (owner / Investigation Officer). */
  escalateSession: async (sessionId: string, body: { severity?: 'P1' | 'P2' | 'P3'; note?: string }) => {
    const res = await apiClient.post(`/scan-sessions/${encodeURIComponent(sessionId)}/escalate`, body);
    return unwrap<{ investigationId: string; joined: boolean; alreadyEscalated: boolean }>(res);
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
