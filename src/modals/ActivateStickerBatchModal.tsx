import { useMemo, useState } from 'react';
import { labelsApi } from '../api/labels';
import { stickersApi } from '../api/stickers';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { ImageUploadZone } from '../components/wizards/ImageUploadZone';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { ActivateStickerBatchPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';

interface Props {
  open: boolean;
  order?: ActivateStickerBatchPayload;
  onClose: () => void;
}

type ViewCount = 1 | 2 | 4 | 6;

const VIEW_SLOTS: Record<ViewCount, { key: string; label: string; required?: boolean }[]> = {
  1: [{ key: 'front', label: 'Front', required: true }],
  2: [
    { key: 'front', label: 'Front', required: true },
    { key: 'back', label: 'Back', required: true },
  ],
  4: [
    { key: 'front', label: 'Front', required: true },
    { key: 'back', label: 'Back', required: true },
    { key: 'left', label: 'Left' },
    { key: 'right', label: 'Right' },
  ],
  6: [
    { key: 'front', label: 'Front', required: true },
    { key: 'back', label: 'Back', required: true },
    { key: 'left', label: 'Left' },
    { key: 'right', label: 'Right' },
    { key: 'top', label: 'Top' },
    { key: 'bottom', label: 'Bottom' },
  ],
};

export function ActivateStickerBatchModal({ open, order, onClose }: Props) {
  const { refreshStickerOrders, refreshBatches, refreshAccount } = useTenantData();
  const { showToast } = useToast();
  const [units, setUnits] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [viewCount, setViewCount] = useState<ViewCount>(2);
  const [images, setImages] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const ref = order?.ref || 'STK-0001';
  const product = order?.product || 'Product';
  const printed = order?.printed ?? 0;
  const planned = order?.planned ?? 0;
  const productId = order?.productId;

  const applied = parseInt(units, 10) || 0;
  const surplus = Math.max(0, printed - applied);
  const slots = VIEW_SLOTS[viewCount];

  const canSubmit = useMemo(() => {
    if (!batchNumber.trim() || !units || !manufactureDate || !expiryDate) return false;
    if (!applied || applied < 1 || applied > printed) return false;
    return slots.filter((s) => s.required).every((s) => Boolean(images[s.key]));
  }, [batchNumber, units, manufactureDate, expiryDate, applied, printed, slots, images]);

  const handleClose = () => {
    setUnits('');
    setBatchNumber('');
    setManufactureDate('');
    setExpiryDate('');
    setViewCount(2);
    setImages({});
    onClose();
  };

  const handleActivate = async () => {
    if (!order?.id || !canSubmit) {
      showToast('Complete required fields and upload the front image to activate.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const expiryTs = new Date(expiryDate).getTime();
      const manufactureTs = new Date(manufactureDate).getTime();
      const result = await stickersApi.activate(order.id, {
        batchNumber: batchNumber.trim(),
        quantity: applied,
        expiryDate: expiryTs,
        manufactureDate: manufactureTs,
      });

      const front = images.front;
      const back = images.back || images.front;
      if (front && productId) {
        try {
          await labelsApi.upload(productId, result.batchId, front, back!);
        } catch (uploadErr) {
          showToast(
            uploadErr instanceof Error
              ? `Batch activated, but DORA upload failed: ${uploadErr.message}`
              : 'Batch activated, but DORA upload failed.',
            'warn',
          );
        }
      }

      await Promise.all([refreshStickerOrders(), refreshBatches(), refreshAccount()]);
      handleClose();
      showToast(
        `${ref} activated as ${result.batchNumber}. ${result.pinCreditsReturned.toLocaleString()} surplus PIN credits returned. DORA training submitted.`,
        'success',
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not activate batch.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Activate Batch — ${ref}`}
      width={560}
      subtitle={`${product} · ${printed.toLocaleString()} stickers delivered (${planned.toLocaleString()} planned + 10% overage)`}
    >
      <div
        style={{
          padding: '9px 12px',
          background: 'var(--gb)',
          borderRadius: 7,
          fontSize: 12,
          color: 'var(--gt)',
          marginBottom: 14,
        }}
      >
        ✓ After activation, PINs move from DORMANT to ACTIVE. DORA verification live in under 15 minutes. Unused
        sticker credits returned immediately.
      </div>

      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 13,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 10,
          }}
        >
          Production Batch Details
        </div>
        <div className="fr2">
          <FormGroup label="Batch Number *">
            <div style={{ display: 'flex', gap: 7 }}>
              <input
                className="inp"
                placeholder="e.g. BTH-2026-042"
                style={{ flex: 1, fontFamily: "'DM Mono', monospace" }}
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                  setBatchNumber(`BTH-${stamp.slice(2)}-${Math.floor(Math.random() * 900 + 100)}`);
                }}
              >
                ✦
              </Button>
            </div>
          </FormGroup>
          <FormGroup label="Actual Units Applied *" hint={`Max ${printed.toLocaleString()} (stickers delivered)`}>
            <input
              className="inp"
              type="number"
              placeholder={`e.g. ${planned}`}
              max={printed}
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className="fr2">
          <FormGroup label="Manufacture Date *">
            <input
              className="inp"
              type="date"
              value={manufactureDate}
              onChange={(e) => setManufactureDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Expiry Date *">
            <input className="inp" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </FormGroup>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 13,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 8,
          }}
        >
          Credit Impact
        </div>
        {[
          ['Stickers delivered (incl. 10% overage)', printed.toLocaleString()],
          ['Actual units applied', applied > 0 ? applied.toLocaleString() : '—'],
          ['Surplus credits returned', surplus > 0 || applied > 0 ? surplus.toLocaleString() : '—'],
          ['Batch calibration credit', '1'],
        ].map(([label, val], i) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '3px 0',
              borderBottom: '1px solid var(--bg2)',
            }}
          >
            <span>{label}</span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                color: i === 2 && surplus > 0 ? 'var(--green)' : undefined,
              }}
            >
              {val}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: 700 }}>
          <span>Net credits deducted</span>
          <span style={{ fontFamily: "'DM Mono', monospace" }}>
            {applied > 0 ? `${applied.toLocaleString()} PIN + 1 cal` : '—'}
          </span>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 13,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            DORA AI Reference Images
          </div>
          <FormGroup label="Number of product views *" hint="">
            <select
              className="inp"
              style={{ minWidth: 170 }}
              value={viewCount}
              onChange={(e) => {
                setViewCount(Number(e.target.value) as ViewCount);
                setImages({});
              }}
            >
              <option value={1}>1 side — Front only</option>
              <option value={2}>2 sides — Front &amp; Back</option>
              <option value={4}>4 sides — Front, Back, Left &amp; Right</option>
              <option value={6}>6 sides — All faces</option>
            </select>
          </FormGroup>
        </div>
        <div
          style={{
            padding: '8px 10px',
            background: 'var(--bb)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--bt)',
            marginBottom: 10,
          }}
        >
          Upload whole-product photographs with the full product in frame. Training currently submits front + back to
          DORA. Extra views are collected for ops review.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {slots.map((slot) => (
            <ImageUploadZone
              key={slot.key}
              label={`${slot.label}${slot.required ? ' *' : ''}`}
              required={slot.required}
              file={images[slot.key]}
              onFileChange={(f) => setImages((prev) => ({ ...prev, [slot.key]: f }))}
            />
          ))}
        </div>
      </div>

      <ModalFooter>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--text3)' }}>
          {canSubmit
            ? 'Ready to activate.'
            : 'Complete required fields and upload the front image to activate.'}
        </div>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="accent" onClick={handleActivate} disabled={submitting || !canSubmit}>
          {submitting ? 'Activating…' : 'Activate & Upload →'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
