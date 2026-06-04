import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormGroup } from '../../components/ui/FormGroup';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { TabBar } from '../../components/ui/TabBar';
import { Toggle } from '../../components/ui/Toggle';
import { useToast } from '../../context/ToastContext';
import { useTabs } from '../../hooks/useTabs';

type BatchSettingsTab = 'profile' | 'notifications' | 'usage';

const TABS = [
  { id: 'profile' as const, label: 'My Profile' },
  { id: 'notifications' as const, label: 'Notifications' },
  { id: 'usage' as const, label: 'Credit Balances' },
];

export function BatchSettingsPage() {
  const { showToast } = useToast();
  const { active, setActive } = useTabs<BatchSettingsTab>('profile');

  return (
    <>
      <PageHeader title="Settings" subtitle="Batch Admin · Profile and notifications" />

      <RestrictBanner>
        🔒 Team management and billing are managed by your Account Owner. Contact them to invite
        members or purchase credits.
      </RestrictBanner>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as BatchSettingsTab)} />

      {active === 'profile' && (
        <Card>
          <div className="fr2">
            <FormGroup label="First Name">
              <input className="inp" defaultValue="Sarah" />
            </FormGroup>
            <FormGroup label="Last Name">
              <input className="inp" defaultValue="Adeyemi" />
            </FormGroup>
          </div>
          <FormGroup
            label="Email Address"
            hint="Contact your Account Owner to change email."
          >
            <input className="inp" defaultValue="sarah@sartorhealth.com" readOnly />
          </FormGroup>
          <FormGroup label="Role">
            <input className="inp" defaultValue="Batch Admin" readOnly />
          </FormGroup>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 6 }}>
            <FormGroup label="Current Password">
              <input className="inp" type="password" placeholder="Enter current password" />
            </FormGroup>
            <div className="fr2">
              <FormGroup label="New Password">
                <input className="inp" type="password" placeholder="Min 8 characters" />
              </FormGroup>
              <FormGroup label="Confirm">
                <input className="inp" type="password" placeholder="Repeat password" />
              </FormGroup>
            </div>
          </div>
          <Button style={{ marginTop: 6 }} onClick={() => showToast('Settings saved successfully')}>
            Save Changes
          </Button>
        </Card>
      )}

      {active === 'notifications' && (
        <Card>
          {[
            { label: 'Batch training completion', desc: 'Email when DORA model is ready to deploy', on: true },
            { label: 'Investigation alerts', desc: 'Email when a batch is flagged for investigation', on: true },
            { label: 'Weekly batch summary', desc: 'Active, pending, and closed batches each Monday', on: false },
          ].map((item) => (
            <div key={item.label} className="twrap">
              <div>
                <div className="tlbl">{item.label}</div>
                <div className="tdesc">{item.desc}</div>
              </div>
              <Toggle defaultOn={item.on} />
            </div>
          ))}
        </Card>
      )}

      {active === 'usage' && (
        <Card>
          <div className="stack-3">
            {[
              { label: 'Batch Calibration', value: '18', sub: 'credits remaining', bg: 'var(--bg)', color: undefined },
              { label: 'PIN Authentication', value: '8,200', sub: 'credits remaining', bg: 'var(--bg)', color: undefined },
              { label: 'SMS Notifications', value: '5,876', sub: 'credits remaining', bg: 'var(--ab)', color: 'var(--at)' },
            ].map((c) => (
              <div
                key={c.label}
                style={{ padding: 11, background: c.bg, borderRadius: 7, textAlign: 'center' }}
              >
                <div style={{ fontSize: 11, color: c.color ?? 'var(--text3)', marginBottom: 4 }}>
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    color: c.color,
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 10, color: c.color ?? 'var(--text3)' }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: 9,
              background: 'var(--bb)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--bt)',
              marginTop: 11,
            }}
          >
            ℹ Credits never expire while subscription is active. Contact your Account Owner to purchase
            more.
          </div>
        </Card>
      )}
    </>
  );
}
