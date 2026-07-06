import { useEffect, useState } from 'react';
import { billingApi } from '../api/billing';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { TabBar } from '../components/ui/TabBar';
import { useTabs } from '../hooks/useTabs';
import { useAuthStore } from '../store/authStore';

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

type CreditTab = 'pin' | 'sms' | 'batch';

const TABS = [
  { id: 'pin' as const, label: 'PIN Auth' },
  { id: 'sms' as const, label: 'SMS' },
  { id: 'batch' as const, label: 'Batch Calibration' },
];

const DEFAULT_QTY: Record<CreditTab, number> = {
  pin: 10000,
  sms: 10000,
  batch: 5,
};

export function BuyCreditsModal({ open, onClose, onSuccess }: BuyCreditsModalProps) {
  const { active, setActive } = useTabs<CreditTab>('pin');
  const user = useAuthStore((s) => s.user);
  const [qty, setQty] = useState(DEFAULT_QTY.pin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState<
    Record<string, { label: string; unit: string; pricePerUnit: number; min: number }>
  >({});

  useEffect(() => {
    if (!open) return;
    billingApi.creditPackages().then((r) => setPackages(r.packages)).catch(() => {});
    setQty(DEFAULT_QTY[active]);
    setError('');
  }, [open, active]);

  const pkg = packages[active];
  const amount = pkg ? Math.round(qty * pkg.pricePerUnit) : 0;

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const inv = await billingApi.requestCreditInvoice(active, qty);
      onSuccess(inv.invoiceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Purchase Credits"
      subtitle="Self-service invoice — pay online or contact sales"
      width={500}
    >
      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as CreditTab)} />

      <FormGroup label={pkg ? `${pkg.label} quantity` : 'Quantity'}>
        <input
          className="inp"
          type="number"
          min={pkg?.min ?? 1}
          step={active === 'batch' ? 1 : 1000}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10) || 0)}
        />
        {pkg && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Min {pkg.min.toLocaleString()} {pkg.unit} · ₦{pkg.pricePerUnit}/{pkg.unit}
          </div>
        )}
      </FormGroup>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 14,
          background: 'var(--bb)',
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        <span style={{ fontWeight: 600 }}>Invoice total</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
          <CurrencyAmount nairaAmount={amount} />
        </span>
      </div>

      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ padding: 9, background: 'var(--ab)', borderRadius: 7, fontSize: 12, color: 'var(--at)', marginBottom: 14 }}>
        An invoice is created instantly. Pay via Paystack from Settings, or email{' '}
        <a href="mailto:sales@sartor.ng">sales@sartor.ng</a> for bank transfer ({user?.clientCode || 'your account'}).
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={loading || !pkg}>
          {loading ? 'Creating invoice…' : 'Create invoice & pay'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
