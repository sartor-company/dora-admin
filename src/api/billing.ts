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
  creditType?: 'sms' | 'pin' | 'batch' | 'sku';
  creditQuantity?: number;
}

export interface CreditBundle {
  id: string;
  title: string;
  quantity: number;
  amount: number;
  unitPrice?: number;
  blurb: string;
}

export interface BillingBankAccount {
  currency: string;
  bank: string;
  accountName: string;
  accountNumber: string;
  status?: string;
}

export interface BillingPaymentDetails {
  companyName: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  bankAccounts: BillingBankAccount[];
}

export const billingApi = {
  listInvoices: async () => {
    const res = await apiClient.get('/billing/invoices');
    const data = unwrap<{ data: PlatformInvoice[] }>(res);
    return data.data ?? [];
  },

  paymentDetails: async () => {
    const res = await apiClient.get('/billing/payment-details');
    return unwrap<BillingPaymentDetails>(res);
  },

  initializePayment: async (id: string, email?: string) => {
    const res = await apiClient.post(`/billing/invoices/${id}/pay`, { email });
    return unwrap<{ authorization_url?: string; manual?: boolean; invoiceId?: string }>(res);
  },

  creditPackages: async () => {
    const res = await apiClient.get('/billing/credit-packages');
    return unwrap<{
      bundles?: Record<'pin' | 'sms' | 'batch', CreditBundle[]>;
      packages: Record<
        string,
        { label: string; unit: string; pricePerUnit: number; min: number; step: number }
      >;
    }>(res);
  },

  requestCreditInvoice: async (
    type: 'sms' | 'pin' | 'batch',
    quantity: number,
    bundleId?: string,
  ) => {
    const res = await apiClient.post('/billing/credit-invoice', { type, quantity, bundleId });
    return unwrap<{
      _id?: string;
      invoiceId: string;
      amount: number;
      status: string;
      description: string;
    }>(res);
  },

  requestSkuLicences: async (addCount: number, renewalMonthsRemaining = 7) => {
    const res = await apiClient.post('/billing/sku-licences', { addCount, renewalMonthsRemaining });
    return unwrap<{
      enterprise?: boolean;
      message?: string;
      invoiceId?: string;
      _id?: string;
      amount?: number;
      status?: string;
      description?: string;
      prorata?: number;
      annual?: number;
      newBand?: string;
      total?: number;
    }>(res);
  },
};
