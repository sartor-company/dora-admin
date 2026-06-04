import { useState } from 'react';
import { StepWizardModal, type StepDef } from '../components/wizards/StepWizardModal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { CampaignPoolBuilder } from './CampaignPoolBuilder';

type Scope = 'wide' | 'sku';

interface CampaignWizardModalProps {
  open: boolean;
  onClose: () => void;
  onFinish: () => void;
  onDraft: () => void;
}

export function CampaignWizardModal({
  open,
  onClose,
  onFinish,
  onDraft,
}: CampaignWizardModalProps) {
  const [scope, setScope] = useState<Scope>('wide');

  const scopeStep: StepDef = {
    title: 'Campaign Basics',
    subtitle: 'Step 1 of 4',
    content: (
      <>
        <FormGroup label="Campaign Name *">
          <input className="inp" placeholder="e.g. Welcome & Loyalty Programme, Q2 Sanitiser Promo" />
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
              <div style={{ fontWeight: 600, fontSize: 13, color: scope === 'wide' ? 'var(--pt)' : 'inherit' }}>
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
          <textarea className="inp" rows={2} placeholder="Internal description" style={{ resize: 'vertical' }} />
        </FormGroup>
        <div className="fr2">
          <FormGroup label="Start Date *">
            <input type="date" className="inp" />
          </FormGroup>
          <FormGroup label="End Date (blank = no expiry)">
            <input type="date" className="inp" />
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
            {[
              'Sartor Hand Sanitiser 500ml|SHS-001',
              'Carabiner Holder Pack|CHP-002',
              'Silicone Holder/Hook Pack|SHP-003',
            ].map((p) => {
              const [name, sku] = p.split('|');
              return (
                <label
                  key={sku}
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
                  <input type="checkbox" defaultChecked={sku === 'SHS-001'} style={{ width: 16, height: 16 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sku}</div>
                  </div>
                </label>
              );
            })}
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
      content: <CampaignPoolBuilder />,
    },
    {
      title: 'Review & Activate',
      subtitle: 'Step 4 of 4',
      content: (
        <>
          <div style={{ padding: 12, background: 'var(--gb)', borderRadius: 8, marginBottom: 14, fontSize: 12, color: 'var(--gt)' }}>
            ✓ Review your campaign configuration before activating.
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--bg2)' }}>
              <span style={{ color: 'var(--text2)' }}>Scope</span>
              <strong>{scope === 'wide' ? 'CLIENT_WIDE' : 'SKU_SPECIFIC'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}>
              <span style={{ color: 'var(--text2)' }}>Trigger Pools</span>
              <strong>Configured</strong>
            </div>
          </div>
          <div style={{ padding: 10, background: 'var(--ab)', borderRadius: 7, fontSize: 12, color: 'var(--at)', marginTop: 12 }}>
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
      finishLabel="Activate Campaign"
      onFinish={onFinish}
      extraFooter={
        <Button variant="secondary" onClick={onDraft}>
          Save as Draft
        </Button>
      }
    />
  );
}
