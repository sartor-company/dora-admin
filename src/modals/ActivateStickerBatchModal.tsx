import { useState } from 'react';
import { stickersApi } from '../api/stickers';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { ActivateStickerBatchPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';

interface Props {
  open: boolean;
  order?: ActivateStickerBatchPayload;
  onClose: () => void;
}

export function ActivateStickerBatchModal({ open, order, onClose }: Props) {
  const { refreshStickerOrders, refreshBatches, refreshAccount } = useTenantData();
  const { showToast } = useToast();
  const [units, setUnits] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ref = order?.ref || 'STK-0001';
  const product = order?.product || 'Product';
  const printed = order?.printed ?? 0;
  const planned = order?.planned ?? 0;

  const handleClose = () => {
    setUnits('');
    setBatchNumber('');
    setManufactureDate('');
    setExpiryDate('');
    onClose();
  };

  const handleActivate = async () => {
    if (!order?.id || !batchNumber.trim() || !units || !expiryDate) {
      showToast('Enter batch number, units applied, and expiry date.', 'warn');
      return;
    }
    const quantity = parseInt(units, 10);
    if (!quantity || quantity < 1) {
      showToast('Enter a valid unit count.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const expiryTs = new Date(expiryDate).getTime();
      const manufactureTs = manufactureDate ? new Date(manufactureDate).getTime() : undefined;
      const result = await stickersApi.activate(order.id, {
        batchNumber: batchNumber.trim(),
        quantity,
        expiryDate: expiryTs,
        manufactureDate: manufactureTs,
      });
      await Promise.all([refreshStickerOrders(), refreshBatches(), refreshAccount()]);
      handleClose();
      showToast(
        `${ref} activated as ${result.batchNumber}. PINs are ACTIVE — upload DORA images on the batch to go live.`,
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
      width={520}
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
        ✓ After activation, PINs move from DORMANT to ACTIVE. Upload DORA reference images on the new batch to enable
        verification. Unused sticker credits are returned to your balance.
      </div>

      <div className="fr2">
        <FormGroup label="Actual Units Applied *">
          <input
            className="inp"
            type="number"
            placeholder={`e.g. ${planned}`}
            max={printed}
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Manufacture Date">
          <input
            className="inp"
            type="date"
            value={manufactureDate}
            onChange={(e) => setManufactureDate(e.target.value)}
          />
        </FormGroup>
      </div>

      <FormGroup label="Expiry Date *">
        <input className="inp" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
      </FormGroup>

      <FormGroup label="Batch Number *">
        <div style={{ display: 'flex', gap: 7 }}>
          <input
            className="inp"
            placeholder="e.g. BATCH-2026-Q2-042"
            style={{ flex: 1 }}
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => {
              const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
              setBatchNumber(`BATCH-${stamp}-${Math.floor(Math.random() * 900 + 100)}`);
            }}
          >
            ✦ Generate
          </Button>
        </div>
      </FormGroup>

      <FormGroup label="Reference Photos (1–2 images)">
        <div
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text3)',
          }}
        >
          Upload front &amp; back label photos on the batch detail page after activation.
        </div>
      </FormGroup>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="accent" onClick={handleActivate} disabled={submitting}>
          {submitting ? 'Activating…' : 'Activate Batch'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
