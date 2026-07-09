import type { ApiBatch, ApiProduct } from '../types/api';
import type { BadgeVariant } from '../types';

export function formatApiDate(ts?: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatApiDateShort(ts?: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function productDisplayRow(p: ApiProduct, stats?: { scans: number; authRate: number | null }) {
  const batchCount = p.batches?.length ?? 0;
  const hasTrainedBatch = batchCount > 0 && Boolean(p.productImage);
  return {
    id: p._id,
    name: p.productName,
    sku: p.batchId || p.barcodeNumber || '—',
    category: p.manufacturer || '—',
    batches: batchCount,
    scans: stats?.scans ?? 0,
    authRate: stats?.authRate != null ? `${stats.authRate}%` : '—',
    authRateColor:
      stats?.authRate != null && stats.authRate < 80
        ? 'var(--rt)'
        : stats?.authRate != null && stats.authRate < 95
          ? 'var(--at)'
          : 'var(--gt)',
    doraStatus: hasTrainedBatch ? 'Active' : batchCount > 0 ? 'Pending' : 'Pending',
    doraVariant: (hasTrainedBatch ? 'bg' : 'ba') as BadgeVariant,
    codeType: p.barcodeNumber ? 'GS1' : 'SC Code',
    raw: p,
  };
}

function resolveDoraState(b: ApiBatch) {
  const hasImage = Boolean(b.image);
  const status = b.doraStatus || (hasImage ? 'ready' : 'pending');

  if (status === 'training') {
    return {
      dora: 'Training',
      doraVariant: 'bp' as BadgeVariant,
      needsUpload: false,
      canView: true,
    };
  }
  if (status === 'ready' || hasImage) {
    return {
      dora: 'Ready',
      doraVariant: 'bg' as BadgeVariant,
      needsUpload: false,
      canView: true,
    };
  }
  return {
    dora: '⚠ Upload images',
    doraVariant: 'ba' as BadgeVariant,
    needsUpload: true,
    canView: false,
  };
}

function resolveBatchStatus(b: ApiBatch, doraState: ReturnType<typeof resolveDoraState>) {
  if (b.status === 'paused') {
    return { status: 'Paused', statusVariant: 'bx' as BadgeVariant };
  }
  if (b.status === 'recalled') {
    return { status: 'Closed', statusVariant: 'bx' as BadgeVariant };
  }
  if (doraState.dora === 'Training') {
    return { status: 'Training', statusVariant: 'bp' as BadgeVariant };
  }
  if (doraState.needsUpload) {
    return { status: 'Pending Model', statusVariant: 'ba' as BadgeVariant };
  }
  return { status: 'Active', statusVariant: 'bg' as BadgeVariant };
}

export function batchDisplayRow(
  b: ApiBatch,
  stats?: { scans: number; auths: number; authRate: number | null },
) {
  const productName =
    typeof b.product === 'object' && b.product ? b.product.productName : '—';
  const productId =
    typeof b.product === 'object' && b.product ? b.product._id : (b.product as string);

  const doraState = resolveDoraState(b);
  const statusInfo = resolveBatchStatus(b, doraState);

  const hasStats = stats && (stats.scans > 0 || stats.auths > 0);
  let delivery = 'Not despatched';
  let deliveryVariant: BadgeVariant = 'bx';
  if (hasStats && stats!.auths > 0) {
    delivery = 'In verification';
    deliveryVariant = 'bg';
  }

  return {
    id: b.batchNumber,
    _id: b._id,
    productId,
    product: productName,
    created: formatApiDateShort(b.creationDateTime),
    qty: b.quantity,
    status: statusInfo.status,
    statusVariant: statusInfo.statusVariant,
    auths: stats?.auths != null && stats.auths > 0 ? String(stats.auths) : '—',
    scans: stats?.scans != null && stats.scans > 0 ? String(stats.scans) : '—',
    delivery,
    deliveryVariant,
    dora: doraState.dora,
    doraVariant: doraState.doraVariant,
    needsUpload: doraState.needsUpload,
    canView: doraState.canView,
    authRate:
      stats?.authRate != null
        ? `${stats.authRate}%`
        : stats && stats.scans > 0 && stats.auths > 0
          ? `${Math.round((stats.auths / stats.scans) * 1000) / 10}%`
          : '—',
    authRateColor:
      stats?.authRate != null && stats.authRate < 80
        ? 'var(--rt)'
        : stats?.authRate != null && stats.authRate < 95
          ? 'var(--at)'
          : stats && stats.scans > 0 && stats.auths > 0
            ? 'var(--gt)'
            : 'var(--text3)',
    raw: b,
  };
}

export type ProductRow = ReturnType<typeof productDisplayRow>;
export type BatchRow = ReturnType<typeof batchDisplayRow>;

export function invoiceStatusVariant(status: string): BadgeVariant {
  if (status === 'Paid') return 'bg';
  if (status === 'Overdue') return 'br';
  if (status === 'Due Soon') return 'ba';
  if (status === 'Cancelled') return 'bx';
  return 'bb';
}

export function scanTrendChart(scanTrend: { date: string; count: number }[]) {
  return {
    labels: scanTrend.map((t) => {
      const d = new Date(t.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    data: scanTrend.map((t) => t.count),
  };
}

export function formatPercent(n: number | null | undefined, fallback = '—') {
  if (n == null) return fallback;
  return `${n}%`;
}

export function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
