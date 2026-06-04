import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormGroup } from '../../components/ui/FormGroup';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { TabBar } from '../../components/ui/TabBar';
import { Toggle } from '../../components/ui/Toggle';
import { useToast } from '../../context/ToastContext';
import { useTabs } from '../../hooks/useTabs';

type BrandSettingsTab = 'profile' | 'notifications';

const TABS = [
  { id: 'profile' as const, label: 'My Profile' },
  { id: 'notifications' as const, label: 'Notifications' },
];

export function BrandSettingsPage() {
  const { showToast } = useToast();
  const { active, setActive } = useTabs<BrandSettingsTab>('profile');

  return (
    <>
      <PageHeader title="Settings" subtitle="Brand Manager · Profile and notifications" />

      <RestrictBanner>
        🔒 Team management and billing are managed by your Account Owner.
      </RestrictBanner>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as BrandSettingsTab)} />

      {active === 'profile' && (
        <Card>
          <div className="fr2">
            <FormGroup label="First Name">
              <input className="inp" defaultValue="Adaeze" />
            </FormGroup>
            <FormGroup label="Last Name">
              <input className="inp" defaultValue="Okonkwo" />
            </FormGroup>
          </div>
          <FormGroup label="Email Address">
            <input className="inp" defaultValue="adaeze@sartorhealth.com" readOnly />
          </FormGroup>
          <FormGroup label="Role">
            <input className="inp" defaultValue="Brand Manager" readOnly />
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
            { label: 'Fraud alert notifications', desc: 'Email when a new DORA AI fraud pattern is detected', on: true },
            { label: 'Authentication rate drops', desc: 'Alert if auth rate falls below 90% for any SKU', on: true },
            { label: 'Weekly analytics digest', desc: 'Scan volume and loyalty summary every Monday', on: true },
            { label: 'Geographic hotspot alerts', desc: 'Email when a region exceeds 5% warning rate', on: false },
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
