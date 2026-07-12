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
  deliveryStatus?: string;
  trackingNumber?: string;
  courier?: string;
  activatedAt?: number;
  activatedBatchRef?: string;
  creationDateTime?: number;
  linkStatus?: 'none' | 'partial' | 'complete';
  pinsLinkedCount?: number;
  unlinkedPinCount?: number;
  pinPoolSize?: number;
  canLink?: boolean;
  allocations?: Array<{
    batchId?: string;
    batchNumber?: string;
    pinCount?: number;
    linkedAt?: number;
  }>;
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

export interface LinkableBatch {
  _id: string;
  batchNumber: string;
  quantity: number;
  freeSlots: number;
  linkedSlots: number;
  status?: string;
  maxLinkable: number;
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

  linkableBatches: async (orderId: string) => {
    const res = await apiClient.get(`/sticker-orders/${orderId}/linkable-batches`);
    return unwrap<{
      order: ApiStickerOrder;
      unlinkedPins: number;
      batches: LinkableBatch[];
      productName?: string;
      productId?: string;
      hint?: string;
      matchingBatchCount?: number;
      otherProductBatchCount?: number;
    }>(res);
  },

  link: async (
    orderId: string,
    body: {
      batchId: string;
      quantity?: number;
    },
  ) => {
    const res = await apiClient.post(`/sticker-orders/${orderId}/link`, body);
    return unwrap<{
      order: ApiStickerOrder;
      batchId: string;
      batchNumber: string;
      linkedCount: number;
      unlinkedPinsRemaining: number;
      freeSlotsRemainingOnBatch: number;
      linkStatus: string;
      canLinkMore: boolean;
      pinCreditsReturned: number;
    }>(res);
  },

  /** @deprecated Prefer link() — kept for compatibility */
  activate: async (
    orderId: string,
    body: {
      batchId?: string;
      batchNumber?: string;
      quantity?: number;
      expiryDate?: number;
      manufactureDate?: number;
    },
  ) => {
    const res = await apiClient.post(`/sticker-orders/${orderId}/activate`, body);
    return unwrap<{
      order: ApiStickerOrder;
      batchId: string;
      batchNumber: string;
      linkedCount?: number;
      unlinkedPinsRemaining?: number;
      canLinkMore?: boolean;
      pinCreditsReturned: number;
    }>(res);
  },

  refundUnlinked: async (orderId: string) => {
    const res = await apiClient.post(`/sticker-orders/${orderId}/refund-unlinked`);
    return unwrap<{ pinCreditsReturned: number; order: ApiStickerOrder }>(res);
  },
};
