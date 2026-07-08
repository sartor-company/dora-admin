import { useEffect, useMemo, useState } from 'react';
import { billingApi } from '../api/billing';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { Button } from '../components/ui/Button';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { TabBar } from '../components/ui/TabBar';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import type { BuyCreditsPayload } from '../context/ModalContext';

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: {
    invoiceId: string;
    invoiceDbId?: string;
    amount: number;
    description: string;
    quantity: number;
    creditType: 'pin' | 'sms' | 'batch';
  }) => void;
}

type CreditTab = 'pin' | 'sms' | 'batch';

const TABS = [
  { id: 'pin' as const, label: 'PIN Auth' },
  { id: 'sms' as const, label: 'SMS' },
  { id: 'batch' as const, label: 'Batch Calibration' },
];

const TYPE_LABEL: Record<CreditTab, string> = {
  pin: 'PIN Auth Credits',
  sms: 'SMS Credits',
  batch: 'Batch Calibration Credits',
};

const FALLBACK_BUNDLES: Record<
  CreditTab,
  { id: string; title: string; quantity: number; amount: number; blurb: string }[]
> = {
  pin: [
    {
      id: 'pin-starter',
      title: 'Starter Bundle — 10,000 PINs',
      quantity: 10000,
      amount: 150000,
      blurb: '₦15.00/PIN · Best for low-volume testing',
    },
    {
      id: 'pin-growth',
      title: 'Growth Bundle — 50,000 PINs',
      quantity: 50000,
      amount: 600000,
      blurb: '₦12.00/PIN · 20% saving vs Starter',
    },
    {
      id: 'pin-scale',
      title: 'Scale Bundle — 200,000 PINs',
      quantity: 200000,
      amount: 2000000,
      blurb: '₦10.00/PIN · Best value for high volume',
    },
  ],
  sms: [
    {
      id: 'sms-starter',
      title: 'Starter — 10,000 SMS',
      quantity: 10000,
      amount: 45000,
      blurb: '₦4.50/SMS · Best for pilots',
    },
    {
      id: 'sms-growth',
      title: 'Growth — 50,000 SMS',
      quantity: 50000,
      amount: 200000,
      blurb: '₦4.00/SMS · 11% saving',
    },
    {
      id: 'sms-scale',
      title: 'Scale — 200,000 SMS',
      quantity: 200000,
      amount: 700000,
      blurb: '₦3.50/SMS · 22% saving · high volume',
    },
  ],
  batch: [
    {
      id: 'batch-starter',
      title: 'Starter — 10 calibrations',
      quantity: 10,
      amount: 1500000,
      blurb: '₦150,000/batch · 1 credit = 1 DORA model',
    },
    {
      id: 'batch-scale',
      title: 'Scale — 30 calibrations',
      quantity: 30,
      amount: 3600000,
      blurb: '₦120,000/batch · 20% saving',
    },
    {
      id: 'batch-enterprise',
      title: 'Enterprise — 100 calibrations',
      quantity: 100,
      amount: 10000000,
      blurb: '₦100,000/batch · 33% saving',
    },
  ],
};

function mapInitialTab(tab?: string): CreditTab {
  if (tab === 'sms') return 'sms';
  if (tab === 'cal' || tab === 'batch') return 'batch';
  return 'pin';
}

export function BuyCreditsModal({ open, onClose, onSuccess }: BuyCreditsModalProps) {
  const { navigateTo } = useApp();
  const { getPayload } = useModal();
  const payload = getPayload<BuyCreditsPayload>('buy-credits');
  const [active, setActive] = useState<CreditTab>('pin');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bundles, setBundles] = useState(FALLBACK_BUNDLES);
  const [receipt, setReceipt] = useState<{
    invoiceId: string;
    invoiceDbId?: string;
    amount: number;
    description: string;
    quantity: number;
    creditType: CreditTab;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const initial = mapInitialTab(payload?.tab);
    setActive(initial);
    setError('');
    setReceipt(null);
    billingApi
      .creditPackages()
      .then((r) => {
        if (r.bundles) {
          setBundles({
            pin: r.bundles.pin ?? FALLBACK_BUNDLES.pin,
            sms: r.bundles.sms ?? FALLBACK_BUNDLES.sms,
            batch: r.bundles.batch ?? FALLBACK_BUNDLES.batch,
          });
        }
      })
      .catch(() => {});
  }, [open, payload?.tab]);

  useEffect(() => {
    if (receipt) return;
    const list = bundles[active] || [];
    setSelectedId(list[0]?.id || '');
  }, [active, bundles, receipt]);

  const options = bundles[active] || [];
  const selected = useMemo(
    () => options.find((o) => o.id === selectedId) || options[0],
    [options, selectedId],
  );

  const submit = async () => {
    if (!selected) {
      setError('Please select a credit bundle.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const inv = await billingApi.requestCreditInvoice(active, selected.quantity, selected.id);
      const result = {
        invoiceId: inv.invoiceId,
        invoiceDbId: inv._id,
        amount: inv.amount,
        description: inv.description,
        quantity: selected.quantity,
        creditType: active,
      };
      setReceipt(result);
      onSuccess(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReceipt(null);
    onClose();
  };

  const viewInvoice = () => {
    if (!receipt) return;
    handleClose();
    navigateTo(`/invoices?focus=${encodeURIComponent(receipt.invoiceId)}`);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={receipt ? 'Purchase requested' : 'Purchase Credits'}
      subtitle={
        receipt
          ? 'Invoice created — open it to complete payment'
          : 'Credits never expire while subscription is active'
      }
      width={560}
    >
      {receipt ? (
        <>
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
            ✓ Invoice <strong>{receipt.invoiceId}</strong> created. Credits apply after payment is confirmed.
          </div>
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 14,
              fontSize: 12,
            }}
          >
            {[
              ['Credit type', TYPE_LABEL[receipt.creditType]],
              ['Bundle', receipt.description],
              ['Quantity', receipt.quantity.toLocaleString()],
              ['Amount due', null],
              ['Status', 'Pending'],
            ].map(([label, val], i) => (
              <div
                key={String(label)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i < 4 ? '1px solid var(--bg2)' : undefined,
                  fontWeight: i === 3 ? 700 : 400,
                }}
              >
                <span style={{ color: 'var(--text2)' }}>{label}</span>
                <span style={{ fontFamily: i === 2 || i === 3 ? "'DM Mono', monospace" : undefined }}>
                  {i === 3 ? <CurrencyAmount nairaAmount={receipt.amount} /> : val}
                </span>
              </div>
            ))}
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={viewInvoice}>View Invoice →</Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as CreditTab)} />

          <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
            {options.map((opt) => {
              const on = selected?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedId(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    border: on ? '2px solid var(--navy)' : '1px solid var(--border)',
                    background: on ? 'var(--bb)' : '#fff',
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="radio" readOnly checked={on} style={{ accentColor: 'var(--navy)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{opt.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{opt.blurb}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    <CurrencyAmount nairaAmount={opt.amount} />
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: 9,
              background: 'var(--ab)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--at)',
              marginBottom: 14,
            }}
          >
            ⚠ An invoice is created immediately. Open it to pay; credits apply after payment confirmation.
          </div>

          {error && (
            <div
              style={{
                padding: 9,
                background: 'var(--rb)',
                borderRadius: 7,
                fontSize: 12,
                color: 'var(--rt)',
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading || !selected}>
              {loading ? 'Creating invoice…' : 'Request Purchase'}
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
