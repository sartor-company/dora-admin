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

export function productDisplayRow(p: ApiProduct, stats?: { scans: number; authRate: number | null }) {
  const batchCount = p.batches?.length ?? 0;
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
    doraStatus: batchCount > 0 ? 'Active' : 'Pending',
    doraVariant: (batchCount > 0 ? 'bg' : 'ba') as BadgeVariant,
    codeType: p.barcodeNumber ? 'GS1' : 'Sartor',
    raw: p,
  };
}

export function batchDisplayRow(
  b: ApiBatch,
  stats?: { scans: number; auths: number; authRate: number | null },
) {
  const productName =
    typeof b.product === 'object' && b.product ? b.product.productName : '—';
  const productId =
    typeof b.product === 'object' && b.product ? b.product._id : (b.product as string);
  const hasImage = Boolean(b.image);
  const status = (b.status || 'active').replace(/^\w/, (c) => c.toUpperCase());

  return {
    id: b.batchNumber,
    _id: b._id,
    productId,
    product: productName,
    created: formatApiDate(b.creationDateTime),
    qty: b.quantity,
    status,
    statusVariant: (b.status === 'active' ? 'bg' : 'bx') as BadgeVariant,
    auths: stats?.auths != null ? String(stats.auths) : '—',
    scans: stats?.scans != null ? String(stats.scans) : '—',
    delivery: stats?.scans != null && stats.scans > 0 ? 'Active' : '—',
    deliveryVariant: (stats?.scans != null && stats.scans > 0 ? 'bg' : 'bx') as BadgeVariant,
    dora: hasImage ? 'Uploaded' : 'Pending',
    doraVariant: (hasImage ? 'bg' : 'ba') as BadgeVariant,
    needsUpload: !hasImage,
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
