import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { StaffSettingsForm } from '../../components/settings/StaffSettingsForm';

const NOTIFICATION_ITEMS = [
  { key: 'fraudAlerts', label: 'Fraud alert notifications', desc: 'Email when a new DORA AI fraud pattern is detected', defaultOn: true },
  { key: 'authRateDrops', label: 'Authentication rate drops', desc: 'Alert if auth rate falls below 90% for any SKU', defaultOn: true },
  { key: 'weeklyDigest', label: 'Weekly analytics digest', desc: 'Scan volume and loyalty summary every Monday', defaultOn: true },
  { key: 'geoHotspots', label: 'Geographic hotspot alerts', desc: 'Email when a region exceeds 5% warning rate', defaultOn: false },
];

export function BrandSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Brand Manager · Profile and notifications" />

      <RestrictBanner>🔒 Team management and billing are managed by your Account Owner.</RestrictBanner>

      <StaffSettingsForm roleSubtitle="Brand Manager" notificationItems={NOTIFICATION_ITEMS} />
    </>
  );
}
