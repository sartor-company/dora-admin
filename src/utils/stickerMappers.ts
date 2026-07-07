import type { ApiStickerOrder } from '../api/stickers';
import type { StickerOrderRow } from '../data/stickerOrders';
import { formatApiDate } from './mappers';

export function mapStickerOrder(o: ApiStickerOrder): StickerOrderRow {
  let status: StickerOrderRow['status'];
  if (o.activatedAt) status = 'Activated';
  else if (o.stage === 'delivered') status = 'Delivered';
  else if (o.stage === 'in_transit') status = 'Dispatched';
  else if (o.pinStatus === 'generating' || o.pinStatus === 'complete') status = 'In Production';
  else status = 'Planned';

  const tracking =
    o.trackingNumber && o.trackingNumber.trim()
      ? `${o.courier || 'Courier'} · ${o.trackingNumber}`
      : undefined;

  return {
    id: o._id,
    ref: o.orderId,
    product: o.sku ? `${o.productName} (${o.sku})` : o.productName,
    productId: o.productId,
    planned: o.qtyOrdered,
    printed: o.qtyWithOverage,
    pins: o.qtyWithOverage,
    pinStatus: o.activatedAt ? 'ACTIVE' : 'DORMANT',
    ordered: formatApiDate(o.creationDateTime),
    status,
    tracking,
    batch: o.activatedBatchRef || o.batchRef || undefined,
  };
}
