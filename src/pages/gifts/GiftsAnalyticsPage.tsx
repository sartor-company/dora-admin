import { useEffect, useState } from 'react';
import { giftsApi } from '../../api/gifts';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import type {
  GiftAnalyticsOverview,
  GiftCampaignComparison,
  GiftTriggerBreakdown,
} from '../../types/gifts';

export function GiftsAnalyticsPage() {
  const { navigateTo } = useApp();
  const { openModal } = useModal();
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<GiftAnalyticsOverview | null>(null);
  const [triggers, setTriggers] = useState<GiftTriggerBreakdown[]>([]);
  const [campaigns, setCampaigns] = useState<GiftCampaignComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      giftsApi.analyticsOverview(days),
      giftsApi.analyticsByTrigger(days),
      giftsApi.analyticsCampaigns(days),
    ])
      .then(([ov, tr, cmp]) => {
        if (cancelled) return;
        setOverview(ov);
        setTriggers(tr);
        setCampaigns(cmp);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const kpis = overview?.kpis;

  return (
    <>
      <PageHeader
        title="Gift Engine Analytics"
        subtitle={`Performance across all campaigns · Last ${days} days`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="inp"
              style={{ width: 140 }}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>All time</option>
            </select>
            <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
              Export
            </Button>
          </div>
        }
      />

      {loading && !overview ? (
        <div style={{ padding: 24, color: 'var(--text3)' }}>Loading analytics…</div>
      ) : (
        <>
          <KCardGrid>
            <KCard
              label="Total Eligibility Events"
              value={String(kpis?.eligibilityEvents ?? 0)}
              trend="From redemptions"
              trendType="up"
            />
            <KCard
              label="Total Codes Generated"
              value={String(kpis?.codesGenerated ?? 0)}
              trend={`${kpis?.fulfilRate ?? 0}% fulfil rate`}
              trendType="neu"
            />
            <KCard
              label="Overall Redemption Rate"
              value={`${kpis?.redemptionRate ?? 0}%`}
              trend="Live"
              trendType="up"
            />
            <KCard
              label="PENDING_STOCK Events"
              value={String(kpis?.pendingStock ?? 0)}
              trend="Low stock events"
              trendType="dn"
            />
          </KCardGrid>

          <div className="r2">
            <LineChartCard
              title={`Daily redemptions — last ${days} days`}
              labels={overview?.chart.labels}
              data={overview?.chart.data}
            />
            <Card>
              <div className="ct" style={{ marginBottom: 11 }}>
                Trigger type breakdown
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
                {triggers.map((t) => (
                  <div
                    key={t.trigger}
                    style={{
                      padding: 10,
                      background: t.trigger === 'FIRST_AUTH' ? 'var(--gb)' : 'var(--bb)',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.trigger}</div>
                      <div>
                        {t.events} events · {t.redeemed} redeemed · {t.rate}% rate
                        {t.pendingStock > 0 ? ` · ${t.pendingStock} PENDING_STOCK` : ''}
                      </div>
                    </div>
                    {t.pendingStock > 0 ? (
                      <Badge variant="ba">Low stock</Badge>
                    ) : t.rate > 70 ? (
                      <Badge variant="bg">Strong</Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ marginTop: 12 }}>
            <div className="ct" style={{ marginBottom: 11 }}>
              Campaign comparison
            </div>
            {campaigns.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--text3)' }}>No campaigns yet.</div>
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Scope</th>
                      <th>Status</th>
                      <th>Events</th>
                      <th>Redeemed</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((row) => (
                      <tr
                        key={row._id}
                        className={row.clickable ? 'cl' : undefined}
                        onClick={() =>
                          row.clickable && navigateTo(`/gifts/detail?id=${row._id}`)
                        }
                      >
                        <td>
                          <strong>{row.name}</strong>
                        </td>
                        <td>{row.scope}</td>
                        <td>{row.status}</td>
                        <td>{row.events}</td>
                        <td>{row.redeemed}</td>
                        <td>{row.rate}%</td>
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
