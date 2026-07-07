import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { StaffSettingsForm } from '../../components/settings/StaffSettingsForm';

const NOTIFICATION_ITEMS = [
  { key: 'doraTrainingComplete', label: 'Batch training completion', desc: 'Email when DORA model is ready to deploy', defaultOn: true },
  { key: 'investigationAlerts', label: 'Investigation alerts', desc: 'Email when a batch is flagged for investigation', defaultOn: true },
  { key: 'weeklySummary', label: 'Weekly batch summary', desc: 'Active, pending, and closed batches each Monday', defaultOn: false },
];

export function BatchSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Batch Admin · Profile and notifications" />

      <RestrictBanner>
        🔒 Team management and billing are managed by your Account Owner. Contact them to invite
        members or purchase credits.
      </RestrictBanner>

      <StaffSettingsForm roleSubtitle="Batch Admin" notificationItems={NOTIFICATION_ITEMS} showCredits />
    </>
  );
}
