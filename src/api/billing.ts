import { apiClient, unwrap } from './client';

export interface PlatformInvoice {
  _id: string;
  invoiceId: string;
  description: string;
  amount: number;
  status: 'Pending' | 'Due Soon' | 'Overdue' | 'Paid' | 'Cancelled';
  issuedAt?: number;
  dueAt?: number;
  paidAt?: number;
  creationDateTime?: number;
}

export const billingApi = {
  listInvoices: async () => {
    const res = await apiClient.get('/billing/invoices');
    const data = unwrap<{ data: PlatformInvoice[] }>(res);
    return data.data ?? [];
  },

  initializePayment: async (id: string, email?: string) => {
    const res = await apiClient.post(`/billing/invoices/${id}/pay`, { email });
    return unwrap<{ authorization_url?: string; manual?: boolean; invoiceId?: string }>(res);
  },

  creditPackages: async () => {
    const res = await apiClient.get('/billing/credit-packages');
    return unwrap<{
      packages: Record<
        string,
        { label: string; unit: string; pricePerUnit: number; min: number; step: number }
      >;
    }>(res);
  },

  requestCreditInvoice: async (type: 'sms' | 'pin' | 'batch', quantity: number) => {
    const res = await apiClient.post('/billing/credit-invoice', { type, quantity });
    return unwrap<{
      invoiceId: string;
      amount: number;
      status: string;
      description: string;
    }>(res);
  },
};
