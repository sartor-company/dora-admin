import { useMemo, useState } from 'react';
import { stickersApi } from '../api/stickers';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';
import { useAuthStore } from '../store/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PlaceStickerOrderModal({ open, onClose }: Props) {
  const { products, refreshStickerOrders, refreshAccount } = useTenantData();
  const { showToast } = useToast();
  const address = useAuthStore((s) => s.user?.address);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(address || '');
  const [plannedDate, setPlannedDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    const planned = parseInt(qty, 10);
    if (!planned || planned < 100) return null;
    const overage = Math.ceil(planned * 0.1);
    return { planned, overage, total: planned + overage };
  }, [qty]);

  const reset = () => {
    setProductId('');
    setQty('');
    setDeliveryAddress(address || '');
    setPlannedDate('');
    setInstructions('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!preview || !productId || !deliveryAddress.trim()) return;
    setSubmitting(true);
    try {
      await stickersApi.create({
        productId,
        qtyOrdered: preview.planned,
        deliveryAddress: deliveryAddress.trim(),
        plannedProductionDate: plannedDate || undefined,
        specialInstructions: instructions.trim() || undefined,
      });
      await Promise.all([refreshStickerOrders(), refreshAccount()]);
      handleClose();
      showToast(
        'Sticker order submitted. Sartor will confirm within 1 business day — PINs are generated DORMANT until activation.',
        'success',
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not submit sticker order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Place Sticker Order"
      width={520}
      subtitle="PINs generated at order · DORMANT until activation · 10% overage auto-applied · Standard lead time: 4 weeks"
    >
      <div
        style={{
          background: 'var(--navy)',
          borderRadius: 8,
          padding: '11px 14px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>🚢</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
            Standard Lead Time: 4 weeks from order confirmation
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
            Place orders at least 4 weeks before your planned production run.
          </div>
        </div>
      </div>

      <div className="fr2">
        <FormGroup label="Product SKU *">
          <select className="inp" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select product...</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.barcodeNumber || p.batchId || p._id.slice(-6).toUpperCase()} — {p.productName}
              </option>
            ))}
          </select>
        </FormGroup>
        <FormGroup label="Planned Production Quantity *">
          <input
            className="inp"
            type="number"
            placeholder="e.g. 5,000"
            min={100}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          {preview && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
              +{preview.overage.toLocaleString()} overage (10%) → {preview.total.toLocaleString()} stickers
            </div>
          )}
        </FormGroup>
      </div>

      <FormGroup label="Delivery Address *">
        <input
          className="inp"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Facility address for sticker delivery"
        />
      </FormGroup>

      <div className="fr2">
        <FormGroup label="Production Run Planned For" hint="Advisory — does not change the 4-week lead time">
          <input className="inp" type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
        </FormGroup>
        <FormGroup label="Special Instructions">
          <input
            className="inp"
            placeholder="Optional — e.g. sticker size variant"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </FormGroup>
      </div>

      {preview && (
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '12px 14px',
            marginTop: 10,
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
            Order Summary
          </div>
          {[
            ['Planned quantity', preview.planned.toLocaleString()],
            ['10% overage (auto-applied by Sartor)', preview.overage.toLocaleString()],
            ['Total stickers to be printed', preview.total.toLocaleString()],
            ['PIN credits to be reserved', preview.total.toLocaleString()],
          ].map(([label, val], i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                borderBottom: i < 3 ? '1px solid var(--bg2)' : undefined,
                fontSize: 12,
                fontWeight: i === 3 ? 700 : 400,
              }}
            >
              <span>{label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: i === 3 ? 'var(--navy)' : undefined }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      )}

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!preview || !productId || !deliveryAddress.trim() || submitting}>
          {submitting ? 'Submitting…' : 'Submit Order'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
