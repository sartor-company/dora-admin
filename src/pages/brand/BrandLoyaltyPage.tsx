import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import type { LoyaltyAnalytics } from '../../types/analytics';
import { formatPercent } from '../../utils/mappers';

export function BrandLoyaltyPage() {
  const [loyalty, setLoyalty] = useState<LoyaltyAnalytics | null>(null);

  useEffect(() => {
    analyticsApi.loyalty(30).then(setLoyalty).catch(() => setLoyalty(null));
  }, []);

  const kpis = loyalty?.kpis;

  return (
    <>
      <PageHeader title="Consumer Loyalty" subtitle="Points, redemptions and gift distribution" />

      <KCardGrid>
        <KCard label="Active Consumers" value={String(kpis?.activeConsumers ?? 0)} trend="All time" trendType="up" />
        <KCard label="New verifications (30d)" value={String(kpis?.newRegistrations ?? 0)} trend="Unique consumers" trendType="up" />
        <KCard label="Points Issued (30d)" value={String(kpis?.pointsIssued ?? 0)} trend="From authentications" trendType="up" />
        <KCard label="Redemption Rate" value={formatPercent(kpis?.redemptionRate)} trend="Gift Engine pending" trendType="neu" />
      </KCardGrid>

      <Card>
        <CardHeader title="Gift distribution performance" />
        <div style={{ padding: 20, fontSize: 13, color: 'var(--text3)' }}>
          {loyalty?.note || 'Gift analytics will appear when the Gift Engine module is enabled.'}
        </div>
      </Card>
    </>
  );
}
