import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { analyticsApi } from '../../api/analytics';
import { batchesApi } from '../../api/batches';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { InfoCell, InfoGrid } from '../../components/ui/InfoGrid';
import { IntegrationBanner } from '../../components/ui/IntegrationBanner';
import { StatBanner } from '../../components/ui/StatBanner';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import type { ApiBatch, ApiProduct } from '../../types/api';
import type { BatchAnalytics } from '../../types/analytics';
import { formatApiDate, formatPercent, scanTrendChart } from '../../utils/mappers';

type BatchDetail = ApiBatch & {
  labels?: unknown[];
  product?: ApiProduct | string;
};

export function BatchDetailPage() {
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('id') || '';
  const { navigateTo, crmEnabled, verifyDomain, isReadOnly } = useApp();
  const { setDoraUploadTarget } = useTenantData();
  const { openModal } = useModal();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [batchAnalytics, setBatchAnalytics] = useState<BatchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!batchId) {
      setLoading(false);
      setError('No batch selected.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    batchesApi
      .get(batchId, true)
      .then((b) => {
        if (!cancelled) {
          setBatch(b);
          setError('');
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load batch.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    analyticsApi.batch(batchId, 30).then(setBatchAnalytics).catch(() => setBatchAnalytics(null));
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const product = typeof batch?.product === 'object' ? batch.product : null;
  const productName = product?.productName || '—';
  const productId = product?._id || (typeof batch?.product === 'string' ? batch.product : '');
  const hasDoraImages = Boolean(batch?.image);
  const pinCount = batch?.labels?.length ?? batch?.quantity ?? 0;
  const statusLabel = (batch?.status || 'active').replace(/^\w/, (c) => c.toUpperCase());

  const openDora = () => {
    if (!batch || !productId) return;
    setDoraUploadTarget({
      batchId: batch._id,
      productId,
      batchNumber: batch.batchNumber,
      productName,
    });
    openModal('dora');
  };

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--text3)' }}>Loading batch…</div>;
  }

  if (error || !batch) {
    return (
      <>
        <BackLink onClick={() => navigateTo('/batches')}>← Back to Batches</BackLink>
        <div style={{ padding: 24, color: 'var(--rt)' }}>{error || 'Batch not found.'}</div>
      </>
    );
  }

  return (
    <>
      <BackLink onClick={() => navigateTo('/batches')}>← Back to Batches</BackLink>

      <div className="int-banners">
        {crmEnabled && (
          <IntegrationBanner
            variant="crm"
            label="Sartor CRM"
            description="Full delivery tracking, LPO management and rep confirmations live here"
            href="https://crm.sartor.ng"
            linkText="Open CRM ↗"
          />
        )}
        <IntegrationBanner
          variant="dora"
          label="DORA AI"
          description="Consumer-facing verification for this batch"
          href={`https://${verifyDomain}`}
          linkText="View ↗"
        />
      </div>

      <div className="pghead">
        <div className="title-row">
          <div className="pgtitle">{batch.batchNumber}</div>
          <Badge variant={batch.status === 'active' ? 'bg' : 'bx'}>{statusLabel}</Badge>
        </div>
        <div className="pghead-actions">
          {!isReadOnly && (
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                openModal('flag-batch-inv', {
                  batchId: batch._id,
                  batchNumber: batch.batchNumber,
                  productName,
                })
              }
            >
              Flag for Investigation
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={openDora}>
            {hasDoraImages ? 'Retrain DORA' : 'Upload DORA Images'}
          </Button>
        </div>
      </div>

      <StatBanner
        stats={[
          { label: 'Quantity', value: String(batch.quantity) },
          { label: 'PINs generated', value: String(pinCount) },
          { label: 'Scans (30d)', value: String(batchAnalytics?.scans ?? 0) },
          { label: 'Auth rate', value: formatPercent(batchAnalytics?.authRate), valueColor: 'var(--gt)' },
        ]}
      />

      {batchAnalytics && (
        <div className="r2" style={{ marginBottom: 14 }}>
          <LineChartCard
            title={`Scan trend — ${batch.batchNumber}`}
            labels={scanTrendChart(batchAnalytics.scanTrend).labels}
            data={scanTrendChart(batchAnalytics.scanTrend).data}
          />
        </div>
      )}

      <div className="r2">
        <Card>
          <div className="ct" style={{ marginBottom: 12 }}>
            Batch Information
          </div>
          <InfoGrid cols={3}>
            <InfoCell label="Product" value={productName} />
            <InfoCell label="Manufacturer" value={batch.manufacturer || product?.manufacturer || '—'} />
            <InfoCell label="Expiry Date" value={formatApiDate(batch.expiryDate)} />
            <InfoCell label="Created" value={formatApiDate(batch.creationDateTime)} />
            <InfoCell label="Supplier" value={typeof batch.supplier === 'object' && batch.supplier ? batch.supplier.name || '—' : '—'} />
            <InfoCell label="PINs" value={`${pinCount} generated`} />
          </InfoGrid>
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <CardHeader title="Product & Verification" />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
            {product?.subdomain
              ? `Consumer page: https://${product.subdomain}.${verifyDomain.replace(/^https?:\/\//, '')}`
              : `Verification domain: ${verifyDomain}`}
          </div>
          {productId && (
            <Button variant="secondary" size="sm" onClick={() => navigateTo(`/products/detail?id=${productId}`)}>
              View Product
            </Button>
          )}
        </Card>

        <Card>
          <CardHeader
            title="DORA AI Training"
            action={<Badge variant={hasDoraImages ? 'bg' : 'ba'}>{hasDoraImages ? 'Images uploaded' : 'Pending upload'}</Badge>}
          />
          {hasDoraImages ? (
            <div style={{ padding: 10, background: 'var(--gb)', borderRadius: 7, fontSize: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--gt)', marginBottom: 6 }}>✓ Reference images on file</div>
              <InfoGrid cols={2}>
                <InfoCell label="Front label" value="Uploaded ✓" />
                <InfoCell label="Back label" value="Uploaded ✓" />
              </InfoGrid>
            </div>
          ) : (
            <div style={{ padding: 10, background: 'var(--ab)', borderRadius: 7, fontSize: 12, marginBottom: 8, color: 'var(--at)' }}>
              Upload front and back label images to submit this batch for DORA model training.
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={openDora}>
            {hasDoraImages ? 'Retrain DORA Model' : 'Upload DORA Images'}
          </Button>
        </Card>
      </div>
    </>
  );
}
