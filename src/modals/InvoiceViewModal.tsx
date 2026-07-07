import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { billingApi } from '../api/billing';
import type { InvoiceViewPayload } from '../context/ModalContext';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { formatApiDate, invoiceStatusVariant } from '../utils/mappers';

interface Props {
  open: boolean;
  invoice?: InvoiceViewPayload;
  onClose: () => void;
}

export function InvoiceViewModal({ open, invoice, onClose }: Props) {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const userEmail = useAuthStore((s) => s.user?.email);

  const canPay =
    invoice &&
    (invoice.status === 'Pending' || invoice.status === 'Due Soon' || invoice.status === 'Overdue');

  const handlePay = async () => {
    if (!invoice) return;
    try {
      const result = await billingApi.initializePayment(invoice._id, userEmail);
      if (result.authorization_url) {
        window.open(result.authorization_url, '_blank', 'noopener,noreferrer');
        showToast('Complete payment in the Paystack window.', 'success');
        onClose();
      } else {
        onClose();
        openModal('payment-gateway', {
          amount: `₦${invoice.amount.toLocaleString()}`,
          description: invoice.description,
          sub: invoice.invoiceId,
          invoiceDbId: invoice._id,
        });
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not start payment.', 'error');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invoice"
      width={480}
      subtitle="Payable to Sartor Limited · RC 1845734"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
        <span style={{ color: 'var(--text3)' }}>Invoice No.</span>
        <strong style={{ fontFamily: "'DM Mono', monospace" }}>{invoice?.invoiceId || '—'}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
        <span style={{ color: 'var(--text3)' }}>Date</span>
        <span>{invoice ? formatApiDate(invoice.issuedAt || invoice.creationDateTime) : '—'}</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid var(--border)',
          fontSize: 13,
          gap: 16,
        }}
      >
        <span style={{ color: 'var(--text3)', flexShrink: 0 }}>Description</span>
        <span style={{ textAlign: 'right' }}>{invoice?.description || '—'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
        <span style={{ color: 'var(--text3)' }}>Status</span>
        {invoice ? <Badge variant={invoiceStatusVariant(invoice.status)}>{invoice.status}</Badge> : '—'}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 0',
          fontSize: 19,
          fontWeight: 700,
          color: 'var(--navy)',
        }}
      >
        <span>Total</span>
        <span>{invoice ? <CurrencyAmount nairaAmount={invoice.amount} /> : '—'}</span>
      </div>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={() => showToast(`Invoice ${invoice?.invoiceId || ''} PDF downloading.`, 'success')}
        >
          ↓ Download PDF
        </Button>
        {canPay && <Button onClick={handlePay}>Pay Now →</Button>}
      </ModalFooter>
    </Modal>
  );
}
