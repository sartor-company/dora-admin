import { useState } from 'react';
import { billingApi } from '../api/billing';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { PaymentGatewayPayload } from '../context/ModalContext';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';

interface Props {
  open: boolean;
  payload?: PaymentGatewayPayload;
  onClose: () => void;
}

export function PaymentGatewayModal({ open, payload, onClose }: Props) {
  const { showToast } = useToast();
  const userEmail = useAuthStore((s) => s.user?.email);
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!payload?.invoiceDbId) {
      showToast('Invoice reference missing. Contact billing@sartor.ng to complete payment.', 'warn');
      return;
    }
    setPaying(true);
    try {
      const result = await billingApi.initializePayment(payload.invoiceDbId, userEmail);
      if (result.authorization_url) {
        window.open(result.authorization_url, '_blank', 'noopener,noreferrer');
        onClose();
        showToast('Complete payment in the Paystack window.', 'success');
      } else {
        onClose();
        showToast('Payment request recorded. Sartor billing will confirm shortly.', 'success');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not start payment.', 'error');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="💳 Secure Payment"
      width={460}
      subtitle="Powered by Paystack · SSL 256-bit encrypted"
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '12px 14px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Amount due</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>
            {payload?.amount || '₦0'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{payload?.description || '—'}</div>
          {payload?.sub && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{payload.sub}</div>}
        </div>
      </div>

      {payload?.invoiceDbId ? (
        <>
          <div style={{ padding: '10px 12px', background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 14 }}>
            Pay securely via Paystack. You will be redirected to complete card or bank payment — card details are never stored on Sartor servers.
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={onClose} disabled={paying}>
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={paying}>
              {paying ? 'Opening Paystack…' : 'Pay Now →'}
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <FormGroup label="Card Number">
            <input className="inp" placeholder="0000 0000 0000 0000" maxLength={19} disabled />
          </FormGroup>
          <div style={{ padding: '8px 10px', background: 'var(--gb)', borderRadius: 7, fontSize: 11, color: 'var(--gt)', marginBottom: 14 }}>
            Manual payment: transfer to Sartor Limited · Zenith Bank · 1234567890 · Reference: {payload?.sub || 'invoice'}
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
