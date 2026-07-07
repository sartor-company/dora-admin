import { useEffect, useState } from 'react';
import { batchesApi } from '../api/batches';
import { Button } from '../components/ui/Button';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { BatchActionPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';

interface Props {
  open: boolean;
  batch?: BatchActionPayload;
  onClose: () => void;
}

export function BatchPauseModal({ open, batch, onClose }: Props) {
  const { refreshBatches } = useTenantData();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const batchNumber = batch?.batchNumber || 'Batch';

  const handlePause = async () => {
    if (!batch?.batchId) return;
    setSubmitting(true);
    try {
      await batchesApi.update(batch.batchId, { status: 'paused' });
      await refreshBatches();
      onClose();
      showToast(`${batchNumber} paused. Loyalty accumulation suspended.`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not pause batch.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Pause Batch?" width={440}>
      <div style={{ padding: 12, background: 'var(--ab)', borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--at)', marginBottom: 4 }}>
          ⚠ Consumer scans will continue but loyalty points will not accumulate
        </div>
        <div style={{ fontSize: 12, color: 'var(--at)' }}>
          Pausing suspends loyalty point awards and gift eligibility for {batchNumber}. Unpause by setting the batch
          back to active.
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
        Are you sure you want to pause <strong>{batchNumber}</strong>?
      </p>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="amber" onClick={handlePause} disabled={submitting || !batch?.batchId}>
          {submitting ? 'Pausing…' : 'Pause Batch'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface DownloadProps {
  open: boolean;
  batch?: BatchActionPayload;
  onClose: () => void;
}

export function BatchDownloadModal({ open, batch, onClose }: DownloadProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<Awaited<ReturnType<typeof batchesApi.printPackage>> | null>(null);

  useEffect(() => {
    if (!open || !batch?.batchId) {
      setPkg(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    batchesApi
      .printPackage(batch.batchId)
      .then((data) => {
        if (!cancelled) setPkg(data);
      })
      .catch((e) => {
        if (!cancelled) showToast(e instanceof Error ? e.message : 'Could not load package.', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, batch?.batchId, showToast]);

  const handleDownload = async (fileId: string, format: string, title: string) => {
    if (!batch?.batchId) return;
    try {
      await batchesApi.downloadAsset(batch.batchId, fileId, format);
      showToast(`${title} downloaded (${format}).`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Download failed.', 'error');
    }
  };

  const subtitle = pkg
    ? `${pkg.batchNumber} · ${pkg.productName} · ${pkg.quantity.toLocaleString()} units`
    : batch
      ? `${batch.batchNumber} · ${batch.productName || 'Product'}`
      : '';

  return (
    <Modal open={open} onClose={onClose} title="Download Batch Package" width={520} subtitle={subtitle}>
      {loading ? (
        <div style={{ padding: 20, color: 'var(--text3)', fontSize: 13 }}>Loading package files…</div>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 9 }}>
            Individual Files
          </div>
          <div style={{ display: 'grid', gap: 7, marginBottom: 14 }}>
            {(pkg?.files ?? []).map((file) => (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{file.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {file.formats.map((fmt) => (
                    <Button
                      key={fmt}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(file.id, fmt, file.title)}
                    >
                      {fmt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: 'var(--navy)',
              borderRadius: 8,
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 1 }}>Complete Package — ZIP</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                QR codes, carton labels, serial manifest &amp; batch summary · no PINs
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload('zip', 'ZIP', 'Complete package')}
            >
              ↓ Download ZIP
            </Button>
          </div>
          <div style={{ padding: '9px 11px', background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)' }}>
            ℹ PINs are generated by Sartor Limited and printed by our retained printers — they are never downloadable here.
          </div>
        </>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
