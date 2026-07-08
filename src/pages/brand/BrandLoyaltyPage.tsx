import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { giftsApi } from '../../api/gifts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import type { LoyaltyAnalytics } from '../../types/analytics';
import type { GiftAnalyticsOverview, GiftCampaignComparison } from '../../types/gifts';
import { formatPercent } from '../../utils/mappers';

export function BrandLoyaltyPage() {
  const { navigateTo } = useApp();
  const [loyalty, setLoyalty] = useState<LoyaltyAnalytics | null>(null);
  const [giftOverview, setGiftOverview] = useState<GiftAnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<GiftCampaignComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      analyticsApi.loyalty(30).catch(() => null),
      giftsApi.analyticsOverview(30).catch(() => null),
      giftsApi.analyticsCampaigns(30).catch(() => []),
    ])
      .then(([loy, ov, cmp]) => {
        if (cancelled) return;
        setLoyalty(loy);
        setGiftOverview(ov);
        setCampaigns(cmp || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = loyalty?.kpis;
  const giftKpis = giftOverview?.kpis;
  const redemption =
    giftKpis?.redemptionRate != null
      ? `${giftKpis.redemptionRate}%`
      : formatPercent(kpis?.redemptionRate);

  return (
    <>
      <PageHeader
        title="Consumer Loyalty"
        subtitle="Points, redemptions and gift distribution"
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/gifts')}>
            Open Gift Engine →
          </Button>
        }
      />

      {loading && !loyalty && !giftOverview ? (
        <div style={{ padding: 24, color: 'var(--text3)' }}>Loading loyalty…</div>
      ) : (
        <>
          <KCardGrid>
            <KCard
              label="Active Consumers"
              value={String(kpis?.activeConsumers ?? 0)}
              trend="All time"
              trendType="up"
            />
            <KCard
              label="New verifications (30d)"
              value={String(kpis?.newRegistrations ?? 0)}
              trend="Unique consumers"
              trendType="up"
            />
            <KCard
              label="Points Issued (30d)"
              value={String(kpis?.pointsIssued ?? 0)}
              trend="From authentications"
              trendType="up"
            />
            <KCard
              label="Gift redemption rate"
              value={redemption}
              trend={
                giftKpis
                  ? `${giftKpis.codesGenerated ?? 0} codes · ${giftKpis.pendingStock ?? 0} pending stock`
                  : 'No gift events yet'
              }
              trendType="neu"
            />
          </KCardGrid>

          <Card>
            <CardHeader
              title="Gift distribution performance"
              action={
                <Button variant="secondary" size="sm" onClick={() => navigateTo('/gifts/analytics')}>
                  Full analytics →
                </Button>
              }
            />
            {campaigns.length === 0 ? (
              <div style={{ padding: 16, fontSize: 13, color: 'var(--text3)' }}>
                {loyalty?.note ||
                  'No gift campaign activity in the last 30 days. Create or activate a campaign under Gift Engine.'}
              </div>
            ) : (
              <TableWrap minWidth={560}>
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Status</th>
                      <th>Events</th>
                      <th>Redeemed</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <button
                            type="button"
                            onClick={() => navigateTo(`/gifts/detail?id=${c._id}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: 'var(--bt)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              font: 'inherit',
                            }}
                          >
                            {c.name}
                          </button>
                        </td>
                        <td>{c.status}</td>
                        <td>{c.events}</td>
                        <td>{c.redeemed}</td>
                        <td>{c.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>
        </>
      )}
    </>
  );
}
