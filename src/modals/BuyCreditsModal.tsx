import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { Button } from '../components/ui/Button';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { TabBar } from '../components/ui/TabBar';
import { useTabs } from '../hooks/useTabs';

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

type CreditTab = 'pin' | 'sms' | 'cal';

const TABS = [
  { id: 'pin' as const, label: 'PIN Auth' },
  { id: 'sms' as const, label: 'SMS' },
  { id: 'cal' as const, label: 'Batch Calibration' },
];

export function BuyCreditsModal({ open, onClose, onSubmit }: BuyCreditsModalProps) {
  const { active, setActive } = useTabs<CreditTab>('pin');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Purchase Credits"
      subtitle="Credits never expire while subscription is active"
      width={500}
    >
      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as CreditTab)} />

      {active === 'pin' && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          <BundleOption
            title="Entry Bundle — 10,000 PINs"
            sub="₦15.00/PIN · Best for low-volume testing"
            amount={150000}
            selected
          />
          <BundleOption title="Growth Bundle — 50,000 PINs" sub="₦12.00/PIN · 20% saving" amount={600000} />
          <BundleOption title="Scale Bundle — 200,000 PINs" sub="₦10.00/PIN · Best value" amount={2000000} />
        </div>
      )}

      {active === 'sms' && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          <BundleOption title="Starter — 10,000 SMS" sub="₦4.50/SMS" amount={45000} selected />
          <BundleOption title="Standard — 50,000 SMS" sub="₦4.00/SMS · 11% saving" amount={200000} />
        </div>
      )}

      {active === 'cal' && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          <BundleOption
            title="Professional Bundle — 30 calibrations"
            sub="₦120,000/batch · Each credit = 1 DORA model calibration"
            amount={3600000}
            selected
          />
          <BundleOption
            title="Enterprise Bundle — 100 calibrations"
            sub="₦100,000/batch · 17% saving"
            amount={10000000}
          />
        </div>
      )}

      <div style={{ padding: 9, background: 'var(--ab)', borderRadius: 7, fontSize: 12, color: 'var(--at)', marginBottom: 14 }}>
        ⚠ Payment is processed via bank transfer. An invoice will be emailed on confirmation. Credits
        are applied within 1 business day of payment confirmation.
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>Request Purchase</Button>
      </ModalFooter>
    </Modal>
  );
}

function BundleOption({
  title,
  sub,
  amount,
  selected,
}: {
  title: string;
  sub: string;
  amount: number;
  selected?: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        border: selected ? '2px solid var(--navy)' : '1px solid var(--border)',
        background: selected ? 'var(--bb)' : '#fff',
        borderRadius: 8,
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: selected ? 'var(--bt)' : 'inherit' }}>{title}</div>
        <div style={{ fontSize: 11, color: selected ? 'var(--bt)' : 'var(--text3)' }}>{sub}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: selected ? 'var(--bt)' : 'inherit' }}>
        <CurrencyAmount nairaAmount={amount} />
      </div>
    </label>
  );
}
