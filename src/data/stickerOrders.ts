export type StickerOrderStatus = 'Planned' | 'In Production' | 'Dispatched' | 'Delivered' | 'Activated';

export interface StickerOrderRow {
  id?: string;
  ref: string;
  product: string;
  productId?: string;
  planned: number;
  printed: number;
  pins: number;
  pinStatus: 'DORMANT' | 'ACTIVE';
  ordered: string;
  status: StickerOrderStatus;
  tracking?: string;
  batch?: string;
}

/** Demo data until sticker-order API is available */
export const DEMO_STICKER_ORDERS: StickerOrderRow[] = [
  {
    ref: 'STK-0001',
    product: 'Hand Sanitiser 500ml (SHS-001)',
    planned: 1820,
    printed: 2002,
    pins: 2002,
    pinStatus: 'DORMANT',
    ordered: 'Mar 12, 2026',
    status: 'Delivered',
  },
  {
    ref: 'STK-0002',
    product: 'Carabiner Holder Pack (CHP-002)',
    planned: 500,
    printed: 550,
    pins: 550,
    pinStatus: 'DORMANT',
    ordered: 'Mar 20, 2026',
    status: 'Dispatched',
    tracking: 'DHL · NG7829104562',
  },
  {
    ref: 'STK-0003',
    product: 'Silicone Holder Pack (SHP-003)',
    planned: 400,
    printed: 440,
    pins: 440,
    pinStatus: 'ACTIVE',
    ordered: 'Feb 8, 2026',
    status: 'Activated',
    batch: 'BATCH-038',
  },
];
