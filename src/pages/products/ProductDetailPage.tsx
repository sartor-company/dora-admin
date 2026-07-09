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
import { productLicencesApi, type ProductLicence } from '../../api/productLicences';
import { formatLicenceDate, licenceStatus } from '../../data/productLicences';
import { useToast } from '../../context/ToastContext';
import { FormGroup } from '../../components/ui/FormGroup';
import { batchDisplayRow, formatApiDate, scanTrendChart } from '../../utils/mappers';

const LICENCE_AUTHORITIES = ['NAFDAC', 'SON', 'PCN', 'FDA (USA)', 'MHRA (UK)', 'CE Marking (EU)', 'Other'];

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
  const { isReadOnly, navigateTo, verifyDomain } = useApp();
  const { setDoraUploadTarget, analytics, investigationStats } = useTenantData();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { active, setActive } = useTabs<ProductTab>('batches');
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [licences, setLicences] = useState<ProductLicence[]>([]);
  const [licencesLoading, setLicencesLoading] = useState(false);
  const [showAddLicence, setShowAddLicence] = useState(false);
  const [licAuthority, setLicAuthority] = useState('NAFDAC');
  const [licNumber, setLicNumber] = useState('');
  const [licMarket, setLicMarket] = useState('Nigeria');
  const [licValidTo, setLicValidTo] = useState('');
  const [licSaving, setLicSaving] = useState(false);
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

  useEffect(() => {
    if (!productId || active !== 'licences') return;
    let cancelled = false;
    setLicencesLoading(true);
    productLicencesApi
      .list(productId)
      .then((rows) => {
        if (!cancelled) setLicences(rows);
      })
      .catch(() => {
        if (!cancelled) setLicences([]);
      })
      .finally(() => {
        if (!cancelled) setLicencesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, active]);

  const addLicence = async () => {
    if (!productId || !licNumber.trim() || !licValidTo) {
      showToast('Enter licence number and valid-to date.', 'warn');
      return;
    }
    setLicSaving(true);
    try {
      const added = await productLicencesApi.add(productId, {
        authority: licAuthority,
        number: licNumber.trim(),
        market: licMarket.trim() || 'Nigeria',
        country: licMarket.trim() || 'Nigeria',
        validTo: new Date(licValidTo).getTime(),
      });
      setLicences((prev) => [...prev, added]);
      setLicNumber('');
      setLicValidTo('');
      setShowAddLicence(false);
      showToast('Licence added.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not add licence.', 'error');
    } finally {
      setLicSaving(false);
    }
  };

  const batchRows = useMemo(
    () =>
      (product?.batches ?? []).map((b) =>
        batchDisplayRow({ ...b, product: product as ApiProduct }),
      ),
    [product],
  );

  const trainedBatches = batchRows.filter((b) => !b.needsUpload);
  const trainingBatches = batchRows.filter((b) => b.status === 'Training');
  const activeBatchCount = batchRows.filter((b) => b.status === 'Active' || b.status === 'Training').length;
  const productAnalytics = analytics?.topProducts?.find((p) => p.productId === productId);
  const openInvestigations = investigationStats?.queue ?? analytics?.kpis.fraudAlerts ?? 0;
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
              {activeBatchCount} active batch{activeBatchCount !== 1 ? 'es' : ''}
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
        <KCard
          label="Total Scans"
          value={(productAnalytics?.scans ?? 0).toLocaleString()}
          trend={productAnalytics?.scans ? 'Last 30 days' : 'No scans yet'}
          trendType={productAnalytics?.scans ? 'up' : 'neu'}
        />
        <KCard
          label="Auth Rate"
          value={productAnalytics?.authRate != null ? `${productAnalytics.authRate}%` : '—'}
          trend={productAnalytics?.authRate != null ? 'Last 30 days' : 'No data yet'}
          trendType={productAnalytics?.authRate != null ? 'up' : 'neu'}
        />
        <KCard
          label="Active Batches"
          value={String(activeBatchCount)}
          trend={trainingBatches.length ? `${trainingBatches.length} in training` : `${trainedBatches.length} with DORA`}
          trendType="neu"
        />
        <KCard
          label="Open Investigations"
          value={String(openInvestigations)}
          trend={openInvestigations ? `${openInvestigations} in queue` : 'None open'}
          trendType={openInvestigations ? 'dn' : 'neu'}
        />
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
              <TableWrap minWidth={880}>
                <table className="resp">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Created</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Delivery</th>
                      <th>Auths</th>
                      <th>Auth Rate</th>
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
                        <td
                          data-label="Batch ID"
                          style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                        >
                          {b.id}
                        </td>
                        <td data-label="Created">{formatApiDate(b.raw.creationDateTime)}</td>
                        <td data-label="Qty">{b.qty}</td>
                        <td data-label="Status">
                          <Badge variant={b.statusVariant}>{b.status}</Badge>
                        </td>
                        <td data-label="Delivery">
                          <Badge variant={b.deliveryVariant} style={{ fontSize: 10 }}>
                            {b.delivery}
                          </Badge>
                        </td>
                        <td data-label="Auths">{b.auths}</td>
                        <td
                          data-label="Auth Rate"
                          style={{ color: b.authRateColor, fontWeight: 600 }}
                        >
                          {b.authRate}
                        </td>
                        <td data-label="DORA">
                          <Badge variant={b.doraVariant}>{b.dora}</Badge>
                        </td>
                        <td data-label="Actions">
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
          <CardHeader
            title="Regulatory Licences"
            action={
              !isReadOnly ? (
                <Button size="sm" onClick={() => setShowAddLicence((v) => !v)}>
                  + Add Licence
                </Button>
              ) : undefined
            }
          />
          {showAddLicence && !isReadOnly && (
            <div
              style={{
                padding: 12,
                marginBottom: 12,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
            >
              <div className="fr2">
                <FormGroup label="Authority">
                  <select className="inp" value={licAuthority} onChange={(e) => setLicAuthority(e.target.value)}>
                    {LICENCE_AUTHORITIES.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Licence Number *">
                  <input className="inp" value={licNumber} onChange={(e) => setLicNumber(e.target.value)} />
                </FormGroup>
              </div>
              <div className="fr2">
                <FormGroup label="Market">
                  <input className="inp" value={licMarket} onChange={(e) => setLicMarket(e.target.value)} />
                </FormGroup>
                <FormGroup label="Valid To *">
                  <input className="inp" type="date" value={licValidTo} onChange={(e) => setLicValidTo(e.target.value)} />
                </FormGroup>
              </div>
              <Button size="sm" onClick={addLicence} disabled={licSaving}>
                {licSaving ? 'Saving…' : 'Save Licence'}
              </Button>
            </div>
          )}
          {licencesLoading ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--text3)' }}>Loading licences…</div>
          ) : licences.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--text3)' }}>
              No regulatory licences on file for this product yet.
            </div>
          ) : (
            <TableWrap minWidth={640}>
              <table>
                <thead>
                  <tr>
                    <th>Authority</th>
                    <th>Licence No.</th>
                    <th>Market</th>
                    <th>Valid From</th>
                    <th>Valid To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {licences.map((lic) => {
                    const status = licenceStatus(lic.validTo);
                    return (
                      <tr key={lic._id}>
                        <td>{lic.authority}</td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{lic.number}</td>
                        <td>{lic.market}</td>
                        <td>{lic.validFrom ? formatLicenceDate(lic.validFrom) : '—'}</td>
                        <td>{formatLicenceDate(lic.validTo)}</td>
                        <td>
                          <Badge variant={status === 'Active' ? 'bg' : status === 'Expiring soon' ? 'ba' : 'br'}>
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      )}
    </>
  );
}
