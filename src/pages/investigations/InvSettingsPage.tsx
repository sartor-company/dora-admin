import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { StaffSettingsForm } from '../../components/settings/StaffSettingsForm';

const NOTIFICATION_ITEMS = [
  { key: 'p1p2Alerts', label: 'New P1/P2 investigation alerts', desc: 'Immediate email on batch mismatch or cloned PIN', defaultOn: true },
  { key: 'allInvestigationAlerts', label: 'All new investigation alerts (P1–P3)', desc: 'Email when any new case is opened', defaultOn: true },
  { key: 'fraudPatternDetection', label: 'Fraud pattern detection', desc: 'Email when lab scan, bimodal, or regional DORA alert triggers', defaultOn: true },
  { key: 'weeklySummary', label: 'Weekly investigation summary', desc: 'Open, resolved, and escalated cases every Monday', defaultOn: false },
];

export function InvSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Investigation Officer · Profile and notifications" />

      <RestrictBanner>🔒 Team management and billing are managed by your Account Owner.</RestrictBanner>

      <StaffSettingsForm roleSubtitle="Investigation Officer" notificationItems={NOTIFICATION_ITEMS} />
    </>
  );
}
