import { useMemo, useState } from 'react';
import { billingApi } from '../api/billing';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';
import { useAuthStore } from '../store/authStore';
import { calcSkuAddCost, SKU_BAND_ROWS } from '../utils/skuBands';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddSkuLicencesModal({ open, onClose }: Props) {
  const { products, refreshInvoices } = useTenantData();
  const { showToast } = useToast();
  const userEmail = useAuthStore((s) => s.user?.email);
  const current = Math.max(products.length, 1);
  const [addCount, setAddCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const cost = useMemo(() => calcSkuAddCost(current, addCount), [current, addCount]);
  const activeBand = cost.newBand.band;

  const handleClose = () => {
    setAddCount(1);
    onClose();
  };

  const handleSubmit = async () => {
    if (addCount < 1) {
      showToast('Enter at least 1 SKU to add.', 'warn');
      return;
    }
    setSubmitting(true);
    try {
      const result = await billingApi.requestSkuLicences(addCount);
      if (result.enterprise) {
        handleClose();
        showToast(
          result.message ||
            `Enterprise SKU request submitted (${result.total} SKUs). Your account manager will confirm pricing.`,
          'success',
        );
        return;
      }
      await refreshInvoices();
      if (result._id) {
        const payment = await billingApi.initializePayment(result._id, userEmail);
        if (payment.authorization_url) {
          window.open(payment.authorization_url, '_blank', 'noopener,noreferrer');
          handleClose();
          showToast('Complete payment in Paystack to activate SKU licences.', 'success');
          return;
        }
      }
      handleClose();
      showToast(
        `Invoice ${result.invoiceId} created for ₦${(result.amount ?? cost.prorata).toLocaleString()}. Pay from Billing settings.`,
        'success',
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not create SKU invoice.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add SKU Licences"
      width={520}
      subtitle="Register additional products for AI authentication"
    >
      <div
        style={{
          padding: '9px 12px',
          background: 'var(--bb)',
          borderRadius: 7,
          fontSize: 12,
          color: 'var(--bt)',
          marginBottom: 14,
        }}
      >
        ℹ SKU licences are billed at a banded annual rate — the more SKUs you hold, the lower the per-SKU rate.
        Adding SKUs that move you into a lower band re-rates <strong>all</strong> your SKUs at the better rate.
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <FormGroup label="Current SKUs">
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {current}
          </div>
        </FormGroup>
        <FormGroup label="SKUs to Add *">
          <input
            className="inp"
            type="number"
            min={1}
            value={addCount}
            onChange={(e) => setAddCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{ fontFamily: "'DM Mono', monospace" }}
          />
        </FormGroup>
        <FormGroup label="New Total">
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--gb)',
              border: '1px solid var(--green)',
              borderRadius: 8,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--gt)',
            }}
          >
            {cost.total}
          </div>
        </FormGroup>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden', marginBottom: 14 }}>
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--bg)',
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            color: 'var(--text3)',
          }}
        >
          Annual Licence Bands — more SKUs, lower rate
        </div>
        {SKU_BAND_ROWS.map((row) => (
          <div
            key={row.band}
            style={{
              padding: '9px 12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              background: activeBand === row.band ? 'var(--gb)' : undefined,
              fontWeight: activeBand === row.band ? 700 : 400,
            }}
          >
            <span>{row.range}</span>
            <span style={{ fontFamily: "'DM Mono', monospace" }}>
              {row.rate ? `${fmt(row.rate)}/SKU/yr` : 'Negotiated enterprise rate'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 13, fontSize: 12 }}>
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
          Cost Impact
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--bg2)' }}>
          <span>New band</span>
          <span style={{ fontWeight: 600 }}>{cost.newBand.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--bg2)' }}>
          <span>Rate per SKU</span>
          <span style={{ fontFamily: "'DM Mono', monospace" }}>
            {cost.newBand.rate ? `${fmt(cost.newBand.rate)}/yr` : 'Negotiated'}
          </span>
        </div>
        {cost.rerate && cost.curBand.rate && cost.newBand.rate && (
          <div
            style={{
              padding: '7px 9px',
              background: 'var(--gb)',
              borderRadius: 6,
              color: 'var(--gt)',
              fontSize: 11,
              margin: '6px 0',
            }}
          >
            ✓ Your {current} existing SKUs now re-rate from {fmt(cost.curBand.rate)} to {fmt(cost.newBand.rate)}
            /SKU — a better rate across the board.
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: 700 }}>
          <span>Pro-rata charge to next renewal</span>
          <span style={{ fontFamily: "'DM Mono', monospace" }}>
            {cost.newBand.rate ? fmt(cost.prorata) : '—'}
          </span>
        </div>
      </div>

      {cost.newBand.rate === null && (
        <div
          style={{
            padding: '9px 12px',
            background: 'var(--ab)',
            borderRadius: 7,
            fontSize: 12,
            color: 'var(--at)',
            marginTop: 10,
          }}
        >
          ⚠ 51+ SKUs uses a negotiated enterprise rate. Submit the request and your Sartor account manager will
          confirm pricing.
        </div>
      )}

      <ModalFooter>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginRight: 'auto' }}>
          New SKUs are activated on payment confirmation.
        </span>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? 'Processing…'
            : cost.newBand.rate === null
              ? 'Request Enterprise Quote →'
              : 'Create Invoice & Pay →'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
