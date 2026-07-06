import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { TabBar } from '../../components/ui/TabBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import { useTabs } from '../../hooks/useTabs';
import type { ApiProduct } from '../../types/api';
import { batchDisplayRow, formatApiDate, scanTrendChart } from '../../utils/mappers';

type ProductTab = 'batches' | 'dora' | 'analytics' | 'licences';

const TABS = [
  { id: 'batches' as const, label: 'Batches' },
  { id: 'dora' as const, label: 'DORA Model' },
  { id: 'analytics' as const, label: 'Analytics' },
  { id: 'licences' as const, label: 'Licences' },
];

export function ProductDetailPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id') || '';
  const { isReadOnly, navigateTo, verifyDomain, crmEnabled } = useApp();
  const { setDoraUploadTarget, analytics } = useTenantData();
  const { openModal } = useModal();
  const { active, setActive } = useTabs<ProductTab>('batches');
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError('No product selected.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    productsApi
      .get(productId)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setError('');
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load product.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const batchRows = useMemo(
    () =>
      (product?.batches ?? []).map((b) =>
        batchDisplayRow({ ...b, product: product as ApiProduct }),
      ),
    [product],
  );

  const trainedBatches = batchRows.filter((b) => !b.needsUpload);
  const verifyUrl = product?.subdomain
    ? `https://${product.subdomain}.${verifyDomain.replace(/^https?:\/\//, '')}`
  : `https://${verifyDomain}`;

  const openDoraForBatch = (row: (typeof batchRows)[0]) => {
    if (!productId) return;
    setDoraUploadTarget({
      batchId: row._id,
      productId,
      batchNumber: row.id,
      productName: product?.productName || row.product,
    });
    openModal('dora');
  };

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--text3)' }}>Loading product…</div>;
  }

  if (error || !product) {
    return (
      <>
        <BackLink onClick={() => navigateTo('/products')}>← Back to Products</BackLink>
        <div style={{ padding: 24, color: 'var(--rt)' }}>{error || 'Product not found.'}</div>
      </>
    );
  }

  return (
    <>
      <BackLink onClick={() => navigateTo('/products')}>← Back to Products</BackLink>

      <div className="pghead" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: product.productImage ? `url(${product.productImage}) center/cover` : 'var(--bg2)',
              borderRadius: 10,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: 'var(--text3)',
              flexShrink: 0,
            }}
          >
            {!product.productImage && 'IMG'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div className="pgtitle">{product.productName}</div>
              {product.barcodeNumber && (
                <span
                  style={{
                    fontSize: 11,
                    background: 'var(--gb)',
                    color: 'var(--gt)',
                    padding: '2px 7px',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  GS1 ✓
                </span>
              )}
              <Badge variant={product.status === 'In-Stock' ? 'bg' : 'ba'}>{product.status || 'Active'}</Badge>
            </div>
            <div className="pgsub">
              SKU: {product.batchId || product.barcodeNumber || '—'} · {product.manufacturer || '—'} ·{' '}
              {batchRows.length} batch{batchRows.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href={verifyUrl} target="_blank" rel="noreferrer" className="btn bsec bsm">
            ↗ Consumer Page
          </a>
          {!isReadOnly && (
            <Button size="sm" onClick={() => openModal('product', { mode: 'edit', product })}>
              Edit Product
            </Button>
          )}
        </div>
      </div>

      <KCardGrid>
        <KCard label="Total Quantity" value={String(product.totalQuantityAvailable ?? 0)} trend="Across all batches" trendType="neu" />
        <KCard label="Active Batches" value={String(batchRows.length)} trend={`${trainedBatches.length} with DORA images`} trendType="neu" />
        <KCard label="Subdomain" value={product.subdomain || '—'} trend="Consumer verify path" trendType="neu" />
        <KCard label="CRM" value={crmEnabled ? 'Enabled' : 'Off'} trend={crmEnabled ? 'Open from sidebar' : 'Not on plan'} trendType="neu" />
      </KCardGrid>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as ProductTab)} />

      {active === 'batches' && (
        <>
          {!isReadOnly && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Button size="sm" onClick={() => openModal('batch')}>
                + Create New Batch
              </Button>
            </div>
          )}
          <Card>
            {batchRows.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>No batches for this product yet.</div>
            ) : (
              <TableWrap minWidth={720}>
                <table>
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Created</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>DORA</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((b) => (
                      <tr
                        key={b._id}
                        className="cl"
                        onClick={() => navigateTo(`/batches/detail?id=${b._id}`)}
                      >
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{b.id}</td>
                        <td>{b.created}</td>
                        <td>{b.qty}</td>
                        <td>
                          <Badge variant={b.statusVariant}>{b.status}</Badge>
                        </td>
                        <td>
                          <Badge variant={b.doraVariant}>{b.dora}</Badge>
                        </td>
                        <td>
                          {b.needsUpload && !isReadOnly ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDoraForBatch(b);
                              }}
                            >
                              Upload
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateTo(`/batches/detail?id=${b._id}`);
                              }}
                            >
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>
        </>
      )}

      {active === 'dora' && (
        <div className="r2">
          <Card>
            <CardHeader
              title="DORA Training Status"
              action={<Badge variant={trainedBatches.length > 0 ? 'bg' : 'ba'}>{trainedBatches.length > 0 ? 'Images uploaded' : 'Pending'}</Badge>}
            />
            <div style={{ padding: 11, background: 'var(--gb)', borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
              {trainedBatches.length > 0 ? (
                <>
                  <div style={{ fontWeight: 600, color: 'var(--gt)', marginBottom: 4 }}>
                    {trainedBatches.length} batch{trainedBatches.length !== 1 ? 'es' : ''} with reference images
                  </div>
                  <div style={{ color: 'var(--gt)' }}>Latest: {trainedBatches[0]?.id} · {trainedBatches[0]?.created}</div>
                </>
              ) : (
                <div style={{ color: 'var(--at)' }}>Upload front and back label images on a batch to start DORA training.</div>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Consumer verification URL:</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="inp" value={verifyUrl} readOnly style={{ flex: 1 }} />
              <a href={verifyUrl} target="_blank" rel="noreferrer" className="btn bsec bsm">
                Preview ↗
              </a>
            </div>
            {!isReadOnly && batchRows.some((b) => b.needsUpload) && (
              <div style={{ marginTop: 12 }}>
                <Button variant="secondary" size="sm" onClick={() => openDoraForBatch(batchRows.find((b) => b.needsUpload)!)}>
                  Upload Training Images
                </Button>
              </div>
            )}
          </Card>
          <Card>
            <div className="ct" style={{ marginBottom: 11 }}>
              Batch training history
            </div>
            <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
              {batchRows.length === 0 ? (
                <div style={{ color: 'var(--text3)' }}>No batches yet.</div>
              ) : (
                batchRows.map((b) => (
                  <div key={b._id} style={{ padding: 9, background: b.needsUpload ? 'var(--ab)' : 'var(--gb)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <strong>{b.id}</strong>
                      <Badge variant={b.doraVariant}>{b.dora}</Badge>
                    </div>
                    <div style={{ color: 'var(--text2)' }}>Created {b.created}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {active === 'analytics' && (
        <div className="r2">
          <LineChartCard
            title="Authentication trend — last 30 days"
            labels={scanTrendChart(analytics?.scanTrend ?? []).labels}
            data={scanTrendChart(analytics?.scanTrend ?? []).data}
          />
          <Card>
            <div className="ct" style={{ marginBottom: 11 }}>
              This product (30d)
            </div>
            {(() => {
              const row = analytics?.topProducts?.find((p) => p.productId === productId);
              return row ? (
                <div style={{ fontSize: 13, display: 'grid', gap: 8 }}>
                  <div>Scans: <strong>{row.scans}</strong></div>
                  <div>Auth rate: <strong>{row.authRate != null ? `${row.authRate}%` : '—'}</strong></div>
                  <div>Batches: <strong>{row.batches}</strong></div>
                </div>
              ) : (
                <div style={{ padding: 12, color: 'var(--text3)', fontSize: 13 }}>No scan data for this product yet.</div>
              );
            })()}
          </Card>
        </div>
      )}

      {active === 'licences' && (
        <Card>
          <div style={{ padding: 20, fontSize: 13, color: 'var(--text3)' }}>
            Regulatory licences for this product can be added in a future release. Product registered{' '}
            {formatApiDate(product.creationDateTime)}.
          </div>
        </Card>
      )}
    </>
  );
}
