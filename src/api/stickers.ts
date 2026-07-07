import { apiClient, unwrap } from './client';

export interface ApiStickerOrder {
  _id: string;
  orderId: string;
  productId?: string;
  sku: string;
  productName: string;
  batchRef: string;
  qtyOrdered: number;
  qtyWithOverage: number;
  stage: string;
  stageLabel: string;
  pinStatus: string;
  qrStatus: string;
  trackingNumber?: string;
  courier?: string;
  activatedAt?: number;
  activatedBatchRef?: string;
  creationDateTime?: number;
}

export interface StickerOrderSummary {
  pendingPin: number;
  pendingQr: number;
  readyDispatch: number;
  inTransit: number;
  total: number;
  awaitingDelivery?: number;
  readyToActivate?: number;
  unitsEnrolled?: number;
}

export const stickersApi = {
  list: async (params?: { search?: string; stage?: string }) => {
    const res = await apiClient.get('/sticker-orders', { params });
    const data = unwrap<{ data: ApiStickerOrder[]; summary: StickerOrderSummary }>(res);
    return data;
  },

  create: async (body: {
    productId: string;
    qtyOrdered: number;
    deliveryAddress: string;
    plannedProductionDate?: string;
    specialInstructions?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/sticker-orders', body);
    return unwrap<ApiStickerOrder>(res);
  },

  activate: async (
    orderId: string,
    body: {
      batchNumber: string;
      quantity: number;
      expiryDate: number;
      manufactureDate?: number;
      invoiceNumber?: string;
      supplier?: string;
    },
  ) => {
    const res = await apiClient.post(`/sticker-orders/${orderId}/activate`, body);
    return unwrap<{
      order: ApiStickerOrder;
      batchId: string;
      batchNumber: string;
      pinCreditsReturned: number;
      batchCalCreditsRemaining: number;
    }>(res);
  },
};
