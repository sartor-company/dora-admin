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
  const { pinCredits, batchCalCredits, isReadOnly, navigateTo } = useApp();
  const { stickerOrders, stickerSummary, refreshStickerOrders, batches } = useTenantData();
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
  const pinPoolTotal = pinCredits + pinReserved;
  const netAvailable = Math.max(pinCredits - pinReserved, 0);

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
  const dispatchedRef = stickerOrders.find((r) => r.status === 'Dispatched')?.ref;
  const deliveredRef = stickerOrders.find((r) => r.status === 'Delivered')?.ref;
  const enrolledBatch =
    stickerOrders.find((r) => r.status === 'Activated' && r.batch)?.batch ?? 'activated batches';

  const openActivate = (row: StickerOrderRow) => {
    if (!row.id) return;
    const payload: ActivateStickerBatchPayload = {
      id: row.id,
      ref: row.ref,
      product: row.product,
      productId: row.productId,
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
                ? `of ${pinPoolTotal.toLocaleString()} · ${pinReserved.toLocaleString()} reserved`
                : pinPoolTotal > pinCredits
                  ? `of ${pinPoolTotal.toLocaleString()}`
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openModal('buy-credits', { tab: 'cal' })}
              >
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
          accent
          valueColor="var(--amber)"
          trend={dispatchedRef ? `${dispatchedRef} in transit` : awaiting ? 'In transit' : 'None in transit'}
        />
        <KCard
          label="Ready to Activate"
          value={String(ready)}
          trend={deliveredRef ? `${deliveredRef} delivered` : ready ? 'Delivered' : 'None ready'}
          trendType={ready ? 'up' : 'neu'}
          valueColor={ready ? 'var(--green)' : undefined}
        />
        <KCard
          label="Units Enrolled"
          value={unitsEnrolled.toLocaleString()}
          trend={unitsEnrolled > 0 ? `↑ via ${enrolledBatch}` : 'None yet'}
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
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option>Delivered</option>
                <option>Dispatched</option>
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
            <table className="resp" style={{ fontSize: 12 }}>
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
                    <td
                      data-label="Order Ref"
                      style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}
                    >
                      {row.ref}
                    </td>
                    <td data-label="Product">{row.product}</td>
                    <td
                      data-label="Planned"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {row.planned.toLocaleString()}
                    </td>
                    <td
                      data-label="Printed (+10%)"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {row.printed.toLocaleString()}
                    </td>
                    <td
                      data-label="PIN Credits"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {row.pins.toLocaleString()}{' '}
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                        ({row.pinStatus})
                      </span>
                    </td>
                    <td data-label="Ordered">{row.ordered}</td>
                    <td data-label="Status">
                      <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                    </td>
                    <td data-label="Action">
                      {row.status === 'Delivered' && !isReadOnly && row.canLink && (
                        <Button size="sm" onClick={() => openActivate(row)}>
                          {row.linkStatus === 'partial' ? 'Add Batch →' : 'Link to Batch →'}
                        </Button>
                      )}
                      {row.status === 'Delivered' && !isReadOnly && !row.canLink && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled
                          title={
                            (row.unlinkedPinCount ?? 0) <= 0
                              ? 'No unlinked PINs on this order — ask Sartor to trigger/re-trigger PINs if needed'
                              : 'Cannot link yet'
                          }
                        >
                          {(row.unlinkedPinCount ?? 0) <= 0 ? 'Awaiting PINs' : 'Cannot Link'}
                        </Button>
                      )}
                      {row.status === 'Activated' && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {row.batch && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const batch = batches.find((b) => b.batchNumber === row.batch);
                                if (batch?._id) navigateTo(`/batches/detail?id=${batch._id}`);
                              }}
                            >
                              View Batch
                            </Button>
                          )}
                          {!isReadOnly && row.canLink && (
                            <Button size="sm" onClick={() => openActivate(row)}>
                              Add Batch →
                            </Button>
                          )}
                          {!row.batch && !row.canLink && (
                            <Button variant="secondary" size="sm" disabled>
                              Activated
                            </Button>
                          )}
                        </div>
                      )}
                      {row.status === 'Dispatched' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            openModal('sticker-track', {
                              ref: row.ref,
                              product: row.product,
                              status: row.status,
                              tracking: row.tracking,
                              ordered: row.ordered,
                              printed: row.printed,
                            })
                          }
                        >
                          Track
                        </Button>
                      )}
                      {(row.status === 'Planned' || row.status === 'In Production') && (
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>
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
        live in under 15 minutes. A 10% overage is automatically added to every order. Unused stickers at activation
        release credits back to your balance instantly.
      </div>
    </>
  );
}
