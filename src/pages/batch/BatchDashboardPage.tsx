import { DonutChartCard } from '../../components/charts/DonutChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardLinkAction } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import { formatCount, formatPercent, scanTrendChart } from '../../utils/mappers';

export function BatchDashboardPage() {
  const { companyName, navigateTo, smsCredits } = useApp();
  const { analytics, batchRows } = useTenantData();
  const { openModal } = useModal();

  const kpis = analytics?.kpis;
  const chart = scanTrendChart(analytics?.scanTrend ?? []);
  const batchBreakdown = analytics?.batchStatusBreakdown;
  const donutData = [
    batchBreakdown?.active ?? 0,
    batchBreakdown?.pendingDora ?? 0,
    batchBreakdown?.other ?? 0,
  ];

  const pendingBatches = batchRows.filter((b) => b.needsUpload);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${companyName} · Batch operations`}
        actions={
          <Button size="sm" onClick={() => openModal('batch')}>
            + Create Batch
          </Button>
        }
      />

      <KCardGrid>
        <KCard label="Total Products" value={String(kpis?.totalProducts ?? 0)} trend="Registered SKUs" trendType="up" />
        <KCard label="Active Batches" value={String(kpis?.activeBatches ?? 0)} trend={`${kpis?.batchesPendingDora ?? 0} pending DORA`} trendType="neu" />
        <KCard label="Scans (30d)" value={formatCount(kpis?.totalScans ?? 0)} trend="Verification events" trendType="up" />
        <KCard label="Auth Rate" value={formatPercent(kpis?.authRate)} trend="30-day window" trendType="up" />
      </KCardGrid>

      <div className="r3">
        <LineChartCard title="Verification scans — last 30 days" labels={chart.labels} data={chart.data} />
        <DonutChartCard
          title="Batch status"
          data={donutData.some((n) => n > 0) ? donutData : [1, 0, 0]}
          colors={['#1DB87A', '#E8930A', '#6B3FD4']}
          legend={
            <div style={{ display: 'grid', gap: 3, marginTop: 7, fontSize: 11 }}>
              {[
                { label: 'Active', count: batchBreakdown?.active ?? 0, color: 'var(--green)' },
                { label: 'Pending DORA', count: batchBreakdown?.pendingDora ?? 0, color: 'var(--amber)' },
                { label: 'Other', count: batchBreakdown?.other ?? 0, color: 'var(--purple)' },
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
          <CardHeader title="Recent batches" action={<CardLinkAction onClick={() => navigateTo('/batches')}>View all →</CardLinkAction>} />
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>DORA</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {batchRows.slice(0, 8).map((b) => (
                  <tr key={b._id} className="cl" onClick={() => navigateTo(`/batches/detail?id=${b._id}`)}>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{b.id}</td>
                    <td>{b.product}</td>
                    <td>
                      <Badge variant={b.statusVariant}>{b.status}</Badge>
                    </td>
                    <td>
                      <Badge variant={b.doraVariant}>{b.dora}</Badge>
                    </td>
                    <td>{b.qty}</td>
                  </tr>
                ))}
                {batchRows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                      No batches yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader title="Alerts" />
          <div style={{ display: 'grid', gap: 8 }}>
            {pendingBatches.slice(0, 3).map((b) => (
              <div key={b._id} style={{ padding: 9, background: 'var(--ab)', borderRadius: 6, fontSize: 12, color: 'var(--at)' }}>
                <strong>{b.id}</strong> — Upload reference images to activate DORA model.
              </div>
            ))}
            {smsCredits < 1000 && (
              <div style={{ padding: 9, background: 'var(--bb)', borderRadius: 6, fontSize: 12, color: 'var(--bt)' }}>
                SMS credits at {smsCredits.toLocaleString()}. Consider purchasing more in Settings → Billing.
              </div>
            )}
            {pendingBatches.length === 0 && smsCredits >= 1000 && (
              <div style={{ padding: 12, color: 'var(--text3)', fontSize: 13 }}>No alerts right now.</div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
