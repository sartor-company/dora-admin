import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { DonutChartCard } from '../../components/charts/DonutChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardLinkAction } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import type { LoyaltyAnalytics } from '../../types/analytics';
import { formatCount, formatPercent, scanTrendChart } from '../../utils/mappers';

export function BrandDashboardPage() {
  const { companyName, navigateTo } = useApp();
  const { analytics } = useTenantData();
  const { openModal } = useModal();
  const [loyalty, setLoyalty] = useState<LoyaltyAnalytics | null>(null);

  useEffect(() => {
    analyticsApi.loyalty(30).then(setLoyalty).catch(() => setLoyalty(null));
  }, []);

  const kpis = analytics?.kpis;
  const chart = scanTrendChart(analytics?.scanTrend ?? []);
  const breakdown = analytics?.resultBreakdown;
  const totalBreakdown = (breakdown?.authentic ?? 0) + (breakdown?.uncertain ?? 0) + (breakdown?.warning ?? 0);
  const donutData = totalBreakdown
    ? [breakdown!.authentic, breakdown!.uncertain, breakdown!.warning]
    : [1, 0, 0];

  return (
    <>
      <PageHeader
        title="Brand Dashboard"
        subtitle={`${companyName} · Authentication & loyalty analytics`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
            Export
          </Button>
        }
      />

      <RestrictBanner>
        🔒 Read-only. Contact your Batch Admin to add or modify products and batches.
      </RestrictBanner>

      <KCardGrid>
        <KCard label="Total Scans (30d)" value={formatCount(kpis?.totalScans ?? 0)} trend="Live data" trendType="up" />
        <KCard label="Auth Rate" value={formatPercent(kpis?.authRate)} trend="30-day window" trendType="up" />
        <KCard label="Active Consumers" value={String(kpis?.activeConsumers ?? 0)} trend="Unique verifiers" trendType="up" />
        <KCard label="Fraud Alerts" value={String(kpis?.fraudAlerts ?? 0)} trend="30-day window" trendType={kpis && kpis.fraudAlerts > 0 ? 'dn' : 'neu'} />
      </KCardGrid>

      <div className="r3">
        <LineChartCard title="Scan volume — last 30 days" labels={chart.labels} data={chart.data} />
        <DonutChartCard
          title="Result breakdown"
          data={donutData}
          colors={['#1DB87A', '#E8930A', '#D63B3B']}
          legend={
            <div style={{ display: 'grid', gap: 3, marginTop: 7, fontSize: 11 }}>
              {[
                { label: 'Authentic', count: breakdown?.authentic ?? 0, color: 'var(--green)' },
                { label: 'Uncertain', count: breakdown?.uncertain ?? 0, color: 'var(--amber)' },
                { label: 'Warning+', count: breakdown?.warning ?? 0, color: 'var(--red)' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    {item.label}
                  </span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          }
        />
      </div>

      <div className="r2">
        <Card>
          <CardHeader title="SKU performance" />
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Scans</th>
                  <th>Auth Rate</th>
                  <th>Batches</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.topProducts ?? []).map((row) => (
                  <tr key={row.productId} className="cl" onClick={() => navigateTo(`/products/detail?id=${row.productId}`)}>
                    <td>{row.name}</td>
                    <td>{row.scans}</td>
                    <td style={{ color: 'var(--gt)', fontWeight: 600 }}>{formatPercent(row.authRate)}</td>
                    <td>{row.batches}</td>
                  </tr>
                ))}
                {(analytics?.topProducts ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                      No scan data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader
            title="Consumer loyalty"
            action={<CardLinkAction onClick={() => navigateTo('/brand/loyalty')}>Details →</CardLinkAction>}
          />
          <div style={{ display: 'grid', gap: 7, fontSize: 12 }}>
            {[
              { label: 'Points Issued (30d)', value: String(loyalty?.kpis.pointsIssued ?? kpis?.pointsIssued ?? 0) },
              { label: 'Active Consumers', value: String(loyalty?.kpis.activeConsumers ?? kpis?.activeConsumers ?? 0) },
              { label: 'New verifications (30d)', value: String(loyalty?.kpis.newRegistrations ?? 0) },
              { label: 'Redemption Rate', value: loyalty?.kpis.redemptionRate != null ? formatPercent(loyalty.kpis.redemptionRate) : '—' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 7, background: 'var(--bg)', borderRadius: 6 }}>
                <span>{item.label}</span>
                <strong style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
