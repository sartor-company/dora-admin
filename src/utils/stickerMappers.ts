import type { ApiStickerOrder } from '../api/stickers';
import type { StickerOrderRow } from '../data/stickerOrders';
import { formatApiDate } from './mappers';

/**
 * Maps platform sticker stages to console statuses (aligned with v4.5.1 labels).
 * New client-submitted orders start as Planned until Sartor ops advances them.
 */
export function mapStickerOrder(o: ApiStickerOrder): StickerOrderRow {
  let status: StickerOrderRow['status'];
  if (o.activatedAt) {
    status = 'Activated';
  } else if (o.stage === 'delivered' || o.deliveryStatus === 'delivered') {
    status = 'Delivered';
  } else if (o.stage === 'in_transit' || o.deliveryStatus === 'in_transit') {
    status = 'Dispatched';
  } else if (
    o.stage === 'ready_dispatch' ||
    o.pinStatus === 'generating' ||
    o.pinStatus === 'complete'
  ) {
    status = 'In Production';
  } else {
    status = 'Planned';
  }

  const tracking =
    o.trackingNumber && o.trackingNumber.trim()
      ? `${o.courier || 'Courier'} · ${o.trackingNumber}`
      : undefined;

  let pinStatus: StickerOrderRow['pinStatus'] = 'DORMANT';
  if (o.activatedAt) pinStatus = 'ACTIVE';
  else if (o.pinStatus === 'complete') pinStatus = 'DORMANT';

  return {
    id: o._id,
    ref: o.orderId,
    product: o.sku ? `${o.productName} (${o.sku})` : o.productName,
    productId: o.productId,
    planned: o.qtyOrdered,
    printed: o.qtyWithOverage,
    pins: o.qtyWithOverage,
    pinStatus,
    ordered: formatApiDate(o.creationDateTime),
    status,
    tracking,
    batch: o.activatedBatchRef || o.batchRef || undefined,
  };
}
