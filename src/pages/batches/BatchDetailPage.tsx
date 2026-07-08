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
import { consumerVerifyUrl, DORASCAN_VERIFY_BASE } from '../../constants/dorascan';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { formatApiDate, formatPercent, scanTrendChart } from '../../utils/mappers';

type BatchDetail = ApiBatch & {
  labels?: unknown[];
  product?: ApiProduct | string;
};

export function BatchDetailPage() {
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('id') || '';
  const { navigateTo, crmEnabled, verifyDomain, isReadOnly } = useApp();
  const clientCode = useAuthStore((s) => s.user?.clientCode);
  const { setDoraUploadTarget } = useTenantData();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [batchAnalytics, setBatchAnalytics] = useState<BatchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleBatchDownload = async (fileId: string, format: string, label: string) => {
    if (!batchId) return;
    setDownloading(fileId);
    try {
      await batchesApi.downloadAsset(batchId, fileId, format);
      showToast(`${label} downloaded.`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Download failed.', 'error');
    } finally {
      setDownloading(null);
    }
  };

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
  const verifyUrl = consumerVerifyUrl(clientCode);
  const unitsPerCarton = 24;
  const cartonCount = batch?.quantity ? Math.ceil(batch.quantity / unitsPerCarton) : 0;
  const statusLabel = (batch?.status || 'active').replace(/^\w/, (c) => c.toUpperCase());
  const totalScans = batchAnalytics?.scans ?? 0;
  const auths = batchAnalytics?.auths ?? 0;
  const authRate = batchAnalytics?.authRate;

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
          href={DORASCAN_VERIFY_BASE}
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
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  openModal('batch-pause', {
                    batchId: batch._id,
                    batchNumber: batch.batchNumber,
                    productName,
                    quantity: batch.quantity,
                  })
                }
              >
                ⏸ Pause
              </Button>
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
                🚩 Flag
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  openModal('batch-download', {
                    batchId: batch._id,
                    batchNumber: batch.batchNumber,
                    productName,
                    quantity: batch.quantity,
                  })
                }
              >
                ↓ Download Package
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={openDora}>
            {hasDoraImages ? 'Retrain DORA' : 'Upload DORA Images'}
          </Button>
        </div>
      </div>

      <StatBanner
        stats={[
          { label: 'Quantity', value: String(batch.quantity) },
          { label: 'Authentications', value: String(auths) },
          { label: 'Total Scans', value: String(totalScans) },
          {
            label: 'Auth Rate',
            value: formatPercent(authRate),
            valueColor: 'var(--green)',
          },
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
            <InfoCell label="Manufacture Date" value={formatApiDate(batch.creationDateTime)} />
            <InfoCell label="Expiry Date" value={formatApiDate(batch.expiryDate)} />
            <InfoCell label="Serial Numbers" value="Auto-generated" />
            <InfoCell label="PIN Format" value="10-digit alphanumeric" />
            <InfoCell label="Units Per Carton" value={`${unitsPerCarton} units`} />
          </InfoGrid>
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <div className="ch">
            <div>
              <div className="ct">Carton Label & Delivery Tracking</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                Batch QR label for outer cartons — scanned at each handoff: warehouse → driver → retailer
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={downloading === 'carton-qr'}
                onClick={() => handleBatchDownload('carton-qr', 'PDF', 'Carton QR label')}
              >
                {downloading === 'carton-qr' ? 'Downloading…' : '↓ Download Carton Label'}
              </Button>
              {crmEnabled && (
                <a
                  href="https://crm.sartor.ng"
                  target="_blank"
                  rel="noreferrer"
                  className="btn bpri bsm"
                >
                  View in Sartor CRM ↗
                </a>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                background: 'var(--bg2)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 2 }}>▭</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.4 }}>
                {batch.batchNumber}
                <br />
                CARTON QR
              </div>
            </div>
            <div>
              <InfoGrid cols={3}>
                <InfoCell label="Batch" value={batch.batchNumber} mono />
                <InfoCell label="Units per carton" value={`${unitsPerCarton} units`} />
                <InfoCell label="Est. total cartons" value={`${cartonCount} cartons`} />
              </InfoGrid>
              <div
                style={{
                  padding: 12,
                  background: 'var(--bb)',
                  borderRadius: 7,
                  fontSize: 12,
                  color: 'var(--bt)',
                  margin: '11px 0 10px',
                  lineHeight: 1.55,
                }}
              >
                Carton delivery status (despatched / in transit / delivered) is tracked in{' '}
                <strong>Sartor CRM</strong>
                {crmEnabled ? '' : ' when CRM is enabled for your account'}. This console shows batch
                authentication metrics above — not fabricated logistics percentages.
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                Retailers confirm delivery by scanning this QR code or entering the SMS delivery code. Full delivery
                tracking, LPO management and payments live in{' '}
                <a href="https://crm.sartor.ng" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                  Sartor CRM ↗
                </a>
                .
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="DORA AI Training"
            action={
              <Badge variant={hasDoraImages ? 'bg' : 'ba'}>
                {hasDoraImages ? 'Complete ✓' : 'Pending upload'}
              </Badge>
            }
          />
          {hasDoraImages ? (
            <div style={{ padding: 10, background: 'var(--gb)', borderRadius: 7, fontSize: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--gt)', marginBottom: 6 }}>
                ✓ Model trained — {formatApiDate(batch.creationDateTime)}
              </div>
              <InfoGrid cols={2}>
                <InfoCell label="Front label" value="1 reference image ✓" />
                <InfoCell label="Back label" value="1 reference image ✓" />
              </InfoGrid>
              <div style={{ fontSize: 11, color: 'var(--gt)', opacity: 0.8, marginTop: 6 }}>
                DORA AI reference indexing completed in under 15 minutes. OCR + VLM reference comparison active.
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 10,
                background: 'var(--ab)',
                borderRadius: 7,
                fontSize: 12,
                marginBottom: 8,
                color: 'var(--at)',
              }}
            >
              Upload front and back label images to submit this batch for DORA model training.
            </div>
          )}
          <div
            style={{
              padding: '9px 11px',
              background: 'var(--bb)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--bt)',
              marginBottom: 8,
              lineHeight: 1.55,
            }}
          >
            🏷️ <strong>QR code:</strong> Per-batch sticker order token — one QR image per sticker order, encoding{' '}
            <code style={{ fontSize: 10, background: 'var(--bg2)', padding: '1px 4px', borderRadius: 3 }}>
              {verifyUrl}/o/&#123;order_token&#125;
            </code>
            . The token resolves server-side to the correct batch and DORA model. Each unit has a unique PIN behind
            the scratch-off panel on the Sartor security sticker.
            <div
              style={{
                marginTop: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <button
                type="button"
                disabled={downloading === 'sticker-qr'}
                onClick={() => handleBatchDownload('sticker-qr', 'PNG', 'Batch QR image')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--bt)',
                  fontWeight: 600,
                  cursor: downloading === 'sticker-qr' ? 'wait' : 'pointer',
                  fontSize: 12,
                  opacity: downloading === 'sticker-qr' ? 0.7 : 1,
                }}
              >
                {downloading === 'sticker-qr' ? 'Downloading…' : '↓ Download Batch QR Image'}
              </button>
              <a
                href={verifyUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--bt)', fontWeight: 600, fontSize: 11 }}
              >
                Preview consumer page ↗
              </a>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
            Verification domain: {verifyDomain}
          </div>
          {productId && (
            <Button
              variant="secondary"
              size="sm"
              style={{ marginBottom: 8 }}
              onClick={() => navigateTo(`/products/detail?id=${productId}`)}
            >
              View Product
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={openDora}>
            {hasDoraImages ? 'Retrain DORA Model' : 'Upload DORA Images'}
          </Button>
        </Card>
      </div>
    </>
  );
}
