import { useMemo, useState } from 'react';
import { StepWizardModal, type StepDef } from '../components/wizards/StepWizardModal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import type { ApiProduct } from '../types/api';
import type { CreateCampaignInput, GiftTrigger } from '../types/gifts';
import { CampaignPoolBuilder, type WizardPool } from './CampaignPoolBuilder';

type Scope = 'wide' | 'sku';

interface CampaignWizardModalProps {
  open: boolean;
  products: ApiProduct[];
  onClose: () => void;
  onSubmit: (payload: CreateCampaignInput) => Promise<void>;
}

const defaultPools = (): WizardPool[] => [
  {
    id: 'pool-1',
    name: 'Pool 1',
    trigger: '',
    nthValue: '',
    leaderboardPeriod: 'CALENDAR_MONTH',
    winnerCount: '10',
    gifts: [],
  },
];

function buildPools(pools: WizardPool[]) {
  return pools
    .filter((p) => p.trigger)
    .map((pool) => ({
      name: pool.name || 'Pool',
      trigger: pool.trigger as GiftTrigger,
      triggerConfig:
        pool.trigger === 'NTH_AUTH'
          ? { nthValue: parseInt(pool.nthValue, 10) || 1 }
          : pool.trigger === 'TOP_SCANNER'
            ? {
                leaderboardPeriod: pool.leaderboardPeriod as 'CALENDAR_MONTH' | 'CAMPAIGN_PERIOD',
                winnerCount: parseInt(pool.winnerCount, 10) || 10,
              }
            : {},
      gifts: pool.gifts
        .filter((g) => g.name && g.qty)
        .map((g) => ({
          name: g.name,
          totalQty: parseInt(g.qty, 10) || 0,
          weight: parseFloat(g.weight) || 1,
        })),
    }))
    .filter((p) => p.gifts.length > 0);
}

export function CampaignWizardModal({
  open,
  products,
  onClose,
  onSubmit,
}: CampaignWizardModalProps) {
  const [scope, setScope] = useState<Scope>('wide');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [pools, setPools] = useState<WizardPool[]>(defaultPools);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setScope('wide');
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setProductIds([]);
    setPools(defaultPools());
  };

  const basePayload = useMemo(
    (): Omit<CreateCampaignInput, 'status' | 'pools'> => ({
      name,
      description,
      scope: scope === 'wide' ? 'CLIENT_WIDE' : 'SKU_SPECIFIC',
      productIds: scope === 'sku' ? productIds : [],
      startDate: startDate || Date.now(),
      endDate: endDate || null,
    }),
    [name, description, scope, productIds, startDate, endDate],
  );

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE') => {
    if (!name.trim()) throw new Error('Campaign name is required');
    if (!startDate && status === 'ACTIVE') throw new Error('Start date is required');
    const builtPools = buildPools(pools);
    if (status === 'ACTIVE' && !builtPools.length) {
      throw new Error('Add at least one pool with gifts before activating');
    }
    setSubmitting(true);
    try {
      await onSubmit({
        ...basePayload,
        status,
        pools: builtPools,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const scopeStep: StepDef = {
    title: 'Campaign Basics',
    subtitle: 'Step 1 of 4',
    content: (
      <>
        <FormGroup label="Campaign Name *">
          <input
            className="inp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Welcome & Loyalty Programme, Q2 Sanitiser Promo"
          />
        </FormGroup>
        <FormGroup label="Campaign Scope *">
          <div className="scope-picker">
            <button
              type="button"
              onClick={() => setScope('wide')}
              style={{
                border: scope === 'wide' ? '2px solid var(--navy)' : '1px solid var(--border)',
                background: scope === 'wide' ? 'var(--pb)' : '#fff',
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: scope === 'wide' ? 'var(--pt)' : 'inherit',
                }}
              >
                CLIENT_WIDE
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                Fires on authentication of any product in your catalogue.
              </div>
            </button>
            <button
              type="button"
              onClick={() => setScope('sku')}
              style={{
                border: scope === 'sku' ? '2px solid var(--navy)' : '1px solid var(--border)',
                background: scope === 'sku' ? 'var(--bb)' : '#fff',
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>SKU_SPECIFIC</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                Fires only when a covered SKU is authenticated.
              </div>
            </button>
          </div>
        </FormGroup>
        <FormGroup label="Description">
          <textarea
            className="inp"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Internal description"
            style={{ resize: 'vertical' }}
          />
        </FormGroup>
        <div className="fr2">
          <FormGroup label="Start Date *">
            <input
              type="date"
              className="inp"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="End Date (blank = no expiry)">
            <input
              type="date"
              className="inp"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormGroup>
        </div>
      </>
    ),
  };

  const skuStep: StepDef = {
    title: 'SKU Assignment',
    subtitle: 'Step 2 of 4',
    content:
      scope === 'wide' ? (
        <div style={{ textAlign: 'center', padding: 24, background: 'var(--gb)', borderRadius: 10 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gt)', marginBottom: 6 }}>
            CLIENT_WIDE — No SKU Assignment Required
          </div>
          <div style={{ fontSize: 13, color: 'var(--gt)' }}>
            This campaign fires on authentication of <strong>any product</strong> in your catalogue.
          </div>
        </div>
      ) : (
        <FormGroup label="Select products">
          <div style={{ display: 'grid', gap: 7 }}>
            {products.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                No products yet — create a product first or save as draft.
              </div>
            )}
            {products.map((p) => (
              <label
                key={p._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={productIds.includes(p._id)}
                  onChange={(e) => {
                    setProductIds((prev) =>
                      e.target.checked
                        ? [...prev, p._id]
                        : prev.filter((id) => id !== p._id),
                    );
                  }}
                  style={{ width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{p.productName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.subdomain || p._id}</div>
                </div>
              </label>
            ))}
          </div>
        </FormGroup>
      ),
  };

  const steps: StepDef[] = [
    scopeStep,
    skuStep,
    {
      title: 'Trigger Pools & Gifts',
      subtitle: 'Step 3 of 4',
      content: <CampaignPoolBuilder pools={pools} onChange={setPools} />,
    },
    {
      title: 'Review & Activate',
      subtitle: 'Step 4 of 4',
      content: (
        <>
          <div
            style={{
              padding: 12,
              background: 'var(--gb)',
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 12,
              color: 'var(--gt)',
            }}
          >
            ✓ Review your campaign configuration before activating.
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--bg2)',
              }}
            >
              <span style={{ color: 'var(--text2)' }}>Name</span>
              <strong>{name || '—'}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--bg2)',
              }}
            >
              <span style={{ color: 'var(--text2)' }}>Scope</span>
              <strong>{scope === 'wide' ? 'CLIENT_WIDE' : 'SKU_SPECIFIC'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}>
              <span style={{ color: 'var(--text2)' }}>Trigger Pools</span>
              <strong>{buildPools(pools).length} configured</strong>
            </div>
          </div>
          <div
            style={{
              padding: 10,
              background: 'var(--ab)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--at)',
              marginTop: 12,
            }}
          >
            ⚠ You must procure and fund all gift items before activating.
          </div>
        </>
      ),
    },
  ];

  return (
    <StepWizardModal
      open={open}
      onClose={onClose}
      steps={steps}
      width={580}
      finishLabel={submitting ? 'Activating…' : 'Activate Campaign'}
      onFinish={async () => {
        await handleSubmit('ACTIVE');
      }}
      extraFooter={
        <Button
          variant="secondary"
          disabled={submitting}
          onClick={async () => {
            await handleSubmit('DRAFT');
          }}
        >
          Save as Draft
        </Button>
      }
    />
  );
}
