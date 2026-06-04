import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormGroup } from '../../components/ui/FormGroup';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { TabBar } from '../../components/ui/TabBar';
import { Toggle } from '../../components/ui/Toggle';
import { useToast } from '../../context/ToastContext';
import { useTabs } from '../../hooks/useTabs';

type InvSettingsTab = 'profile' | 'notifications';

const TABS = [
  { id: 'profile' as const, label: 'My Profile' },
  { id: 'notifications' as const, label: 'Notifications' },
];

export function InvSettingsPage() {
  const { showToast } = useToast();
  const { active, setActive } = useTabs<InvSettingsTab>('profile');

  return (
    <>
      <PageHeader title="Settings" subtitle="Investigation Officer · Profile and notifications" />

      <RestrictBanner>
        🔒 Team management and billing are managed by your Account Owner.
      </RestrictBanner>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as InvSettingsTab)} />

      {active === 'profile' && (
        <Card>
          <div className="fr2">
            <FormGroup label="First Name">
              <input className="inp" defaultValue="Emeka" />
            </FormGroup>
            <FormGroup label="Last Name">
              <input className="inp" defaultValue="Okafor" />
            </FormGroup>
          </div>
          <FormGroup label="Email Address">
            <input className="inp" defaultValue="emeka@sartorhealth.com" readOnly />
          </FormGroup>
          <FormGroup label="Role">
            <input className="inp" defaultValue="Investigation Officer" readOnly />
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
            { label: 'New P1/P2 investigation alerts', desc: 'Immediate email on batch mismatch or cloned PIN', on: true },
            { label: 'All new investigation alerts (P1–P7)', desc: 'Email when any new case is opened', on: true },
            { label: 'Fraud pattern detection', desc: 'Email when lab scan, bimodal, or regional DORA alert triggers', on: true },
            { label: 'Weekly investigation summary', desc: 'Open, resolved, and escalated cases every Monday', on: false },
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
    </>
  );
}
