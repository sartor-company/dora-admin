import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import type { StickerOrderRow } from '../../data/stickerOrders';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import type { ActivateStickerBatchPayload } from '../../context/ModalContext';

const STATUS_VARIANT: Record<StickerOrderRow['status'], 'bg' | 'ba' | 'bx' | 'bb'> = {
  Planned: 'bx',
  'In Production': 'bb',
  Dispatched: 'ba',
  Delivered: 'bg',
  Activated: 'bg',
};

export function StickerOrdersPage() {
  const { pinCredits, batchCalCredits, isReadOnly } = useApp();
  const { stickerOrders, stickerSummary, refreshStickerOrders } = useTenantData();
  const { openModal } = useModal();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refreshStickerOrders()
      .then(() => {
        if (!cancelled) setError('');
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load sticker orders.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshStickerOrders]);

  const pinReserved = stickerOrders
    .filter((r) => r.status !== 'Activated')
    .reduce((sum, r) => sum + r.pins, 0);
  const netAvailable = Math.max(pinCredits, 0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return stickerOrders.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.ref.toLowerCase().includes(q) ||
        row.product.toLowerCase().includes(q) ||
        (row.tracking || '').toLowerCase().includes(q)
      );
    });
  }, [stickerOrders, query, statusFilter]);

  const awaiting = stickerSummary?.awaitingDelivery ?? stickerOrders.filter((r) => r.status === 'Dispatched').length;
  const ready = stickerSummary?.readyToActivate ?? stickerOrders.filter((r) => r.status === 'Delivered').length;
  const unitsEnrolled = stickerSummary?.unitsEnrolled ?? 0;

  const openActivate = (row: StickerOrderRow) => {
    if (!row.id) return;
    const payload: ActivateStickerBatchPayload = {
      id: row.id,
      ref: row.ref,
      product: row.product,
      planned: row.planned,
      printed: row.printed,
    };
    openModal('activate-sticker-batch', payload);
  };

  return (
    <>
      <PageHeader
        title="Sticker Orders"
        subtitle="Order, track and activate Sartor-Chain security stickers"
        actions={
          !isReadOnly ? (
            <Button onClick={() => openModal('place-sticker-order')}>+ Place Sticker Order</Button>
          ) : undefined
        }
      />

      <div className="credit-summary-bar">
        <div className="credit-row">
          <div>
            <div className="credit-lbl">PIN Credits</div>
            <div className="credit-val">{pinCredits.toLocaleString()}</div>
            <div className="credit-sub">
              {pinReserved > 0
                ? `${pinReserved.toLocaleString()} reserved on open orders`
                : 'No credits reserved'}
            </div>
          </div>
          <div className="credit-divider" />
          <div>
            <div className="credit-lbl">Net Available</div>
            <div className="credit-val" style={{ color: 'var(--green)' }}>
              {netAvailable.toLocaleString()}
            </div>
            <div className="credit-sub">Ready for new orders</div>
          </div>
          <div className="credit-divider" />
          <div>
            <div className="credit-lbl">Batch Calibration</div>
            <div className="credit-val">{batchCalCredits}</div>
            <div className="credit-sub">credits remaining</div>
          </div>
          {!isReadOnly && (
            <div style={{ marginLeft: 'auto' }}>
              <Button variant="ghost" size="sm" onClick={() => openModal('buy-credits')}>
                + Buy Credits
              </Button>
            </div>
          )}
        </div>
      </div>

      <KCardGrid>
        <KCard
          label="Total Orders"
          value={loading ? '…' : String(stickerSummary?.total ?? stickerOrders.length)}
          trend="Since onboarding"
        />
        <KCard
          label="Awaiting Delivery"
          value={String(awaiting)}
          trend={awaiting ? `${awaiting} in transit` : 'None in transit'}
        />
        <KCard
          label="Ready to Activate"
          value={String(ready)}
          trend={ready ? `${ready} delivered` : 'None ready'}
          trendType={ready ? 'up' : 'neu'}
        />
        <KCard
          label="Units Enrolled"
          value={unitsEnrolled.toLocaleString()}
          trend={unitsEnrolled > 0 ? 'Activated batches' : 'None yet'}
          trendType={unitsEnrolled > 0 ? 'up' : 'neu'}
        />
      </KCardGrid>

      <Card>
        <CardHeader
          title="Active & Recent Orders"
          action={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                className="inp inp-sm"
                placeholder="Search orders..."
                style={{ maxWidth: 160 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="inp inp-sm"
                style={{ maxWidth: 130 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option>Planned</option>
                <option>In Production</option>
                <option>Dispatched</option>
                <option>Delivered</option>
                <option>Activated</option>
              </select>
            </div>
          }
        />
        {error && (
          <div style={{ padding: 12, color: 'var(--rt)', fontSize: 13 }}>{error}</div>
        )}
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text3)', fontSize: 13 }}>Loading sticker orders…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>
            {stickerOrders.length === 0
              ? 'No sticker orders yet. Place your first order before a production run.'
              : 'No orders match your filters.'}
          </div>
        ) : (
          <TableWrap minWidth={900}>
            <table style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Product</th>
                  <th>Planned</th>
                  <th>Printed (+10%)</th>
                  <th>PIN Credits</th>
                  <th>Ordered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id || row.ref}>
                    <td data-label="Order Ref">
                      <strong>{row.ref}</strong>
                    </td>
                    <td data-label="Product">{row.product}</td>
                    <td data-label="Planned">{row.planned.toLocaleString()}</td>
                    <td data-label="Printed">{row.printed.toLocaleString()}</td>
                    <td data-label="PIN Credits">
                      {row.pins.toLocaleString()}{' '}
                      <span style={{ fontSize: 10, color: row.pinStatus === 'ACTIVE' ? 'var(--gt)' : 'var(--text3)' }}>
                        {row.pinStatus}
                      </span>
                    </td>
                    <td data-label="Ordered">{row.ordered}</td>
                    <td data-label="Status">
                      <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                      {row.tracking && (
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{row.tracking}</div>
                      )}
                      {row.batch && (
                        <div style={{ fontSize: 10, color: 'var(--gt)', marginTop: 2 }}>{row.batch}</div>
                      )}
                    </td>
                    <td data-label="Action">
                      {row.status === 'Delivered' && !isReadOnly && (
                        <Button variant="accent" size="sm" onClick={() => openActivate(row)}>
                          Activate Batch
                        </Button>
                      )}
                      {row.status === 'Activated' && (
                        <Button variant="secondary" size="sm" disabled>
                          Activated
                        </Button>
                      )}
                      {row.status === 'Dispatched' && (
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>In transit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <div
        style={{
          padding: '11px 14px',
          background: 'var(--bb)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--bt)',
          lineHeight: 1.6,
          marginTop: 14,
        }}
      >
        ℹ <strong>How it works:</strong> Place your order before your production run. Sartor generates your PINs
        immediately (DORMANT until activation) and dispatches stickers to your facility. After your run, click{' '}
        <em>Activate Batch</em>, enter actual units applied and upload 1–2 reference photos — DORA verification goes
        live in under 15 minutes. A 10% overage is automatically added to every order.
      </div>
    </>
  );
}
