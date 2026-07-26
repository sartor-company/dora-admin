import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { consumersApi } from '../../api/consumers';
import { giftsApi } from '../../api/gifts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import type { LoyaltyAnalytics } from '../../types/analytics';
import type { ConsumerDirectoryKpis } from '../../types/consumers';
import type { GiftAnalyticsOverview, GiftCampaignComparison } from '../../types/gifts';
import { formatPercent } from '../../utils/mappers';

export function BrandLoyaltyPage() {
  const { navigateTo, navigateWithQuery } = useApp();
  const [loyalty, setLoyalty] = useState<LoyaltyAnalytics | null>(null);
  const [giftOverview, setGiftOverview] = useState<GiftAnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<GiftCampaignComparison[]>([]);
  const [directoryKpis, setDirectoryKpis] = useState<ConsumerDirectoryKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      analyticsApi.loyalty(30).catch(() => null),
      giftsApi.analyticsOverview(30).catch(() => null),
      giftsApi.analyticsCampaigns(30).catch(() => []),
      consumersApi.list().catch(() => null),
    ])
      .then(([loy, ov, cmp, dir]) => {
        if (cancelled) return;
        setLoyalty(loy);
        setGiftOverview(ov);
        setCampaigns(cmp || []);
        setDirectoryKpis(dir?.kpis ?? null);
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
        subtitle="Retention, points economy and outstanding gift entitlements"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => navigateTo('/brand/consumers')}>
              Consumer Directory →
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigateTo('/gifts')}>
              Open Gift Engine →
            </Button>
          </div>
        }
      />

      {loading && !loyalty && !giftOverview ? (
        <div style={{ padding: 24, color: 'var(--text3)' }}>Loading loyalty…</div>
      ) : (
        <>
          <KCardGrid>
            <KCard
              label="Registered Consumers"
              value={String(directoryKpis?.registeredConsumers ?? kpis?.activeConsumers ?? 0)}
              trend="All authenticating consumers"
              trendType="up"
            />
            <KCard
              label="New verifications (30d)"
              value={String(kpis?.newRegistrations ?? 0)}
              trend="Unique consumers"
              trendType="up"
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigateWithQuery('/brand/consumers', { filter: 'near' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateWithQuery('/brand/consumers', { filter: 'near' });
                }
              }}
              style={{ cursor: 'pointer' }}
              title="Open Consumer Directory filtered to these consumers"
            >
              <KCard
                label="Near Next Gift Trigger"
                value={String(directoryKpis?.nearNextGift ?? 0)}
                trend="Consumers at 90+ points → view"
                trendType="neu"
              />
            </div>
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

          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bb)',
              borderRadius: 8,
              fontSize: 11.5,
              color: 'var(--bt)',
              marginTop: 14,
            }}
          >
            ℹ Gift-pool distribution and per-pool performance live under{' '}
            <strong>Gift Engine → Analytics</strong>. Consumer-level records, search and export are in{' '}
            <button
              type="button"
              onClick={() => navigateTo('/brand/consumers')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
                font: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Consumer Directory
            </button>
            .
          </div>
        </>
      )}
    </>
  );
}
