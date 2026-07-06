import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { HealthRow } from '../../components/ui/HealthRow';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import { formatCount, formatPercent, scanTrendChart } from '../../utils/mappers';

export function OwnerDashboardPage() {
  const { clientType, companyName, navigateTo, smsCredits, pinCredits, scBand } = useApp();
  const { analytics, batchRows, loading } = useTenantData();
  const { openModal } = useModal();

  const kpis = analytics?.kpis;
  const chart = scanTrendChart(analytics?.scanTrend ?? []);
  const actions = analytics?.actionsRequired ?? [];

  return (
    <>
      {clientType === 'pilot' && (
        <div className="pilot-banner">
          <div className="pilot-banner-inner">
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#D64000', marginBottom: 4 }}>
                🎓 You are on a Pilot Programme
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                {scBand} band · Full platform access during pilot · Convert to Full Deployment to unlock annual SKU licensing.
              </div>
            </div>
            <Button
              style={{ background: '#D64000', color: '#fff' }}
              onClick={() => openModal('convert-deployment')}
            >
              Convert to Full Deployment
            </Button>
          </div>
        </div>
      )}

      <PageHeader
        title="Account Overview"
        subtitle={`${companyName} · Full platform summary`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
            Export Report
          </Button>
        }
      />

      <KCardGrid>
        <KCard
          label="Total Products"
          value={loading && !kpis ? '…' : String(kpis?.totalProducts ?? 0)}
          trend={`${kpis?.activeBatches ?? 0} active batches`}
          trendType="neu"
        />
        <KCard
          label="Active Batches"
          value={loading && !kpis ? '…' : String(kpis?.activeBatches ?? 0)}
          trend={`${kpis?.batchesPendingDora ?? 0} pending DORA`}
          trendType="neu"
        />
        <KCard
          label="Auth Rate (30d)"
          value={formatPercent(kpis?.authRate)}
          trend={`${formatCount(kpis?.totalScans ?? 0)} scans`}
          trendType="up"
        />
        <KCard
          label="Fraud Alerts (30d)"
          value={String(kpis?.fraudAlerts ?? 0)}
          trend={`${kpis?.activeConsumers ?? 0} consumers`}
          trendType={kpis && kpis.fraudAlerts > 0 ? 'dn' : 'neu'}
        />
      </KCardGrid>

      <div className="r2">
        <LineChartCard title="Scan volume — last 30 days" labels={chart.labels} data={chart.data} />
        <Card>
          <CardHeader title="Platform health" />
          <div>
            <HealthRow
              dotColor="var(--green)"
              label="Authentication Rate"
              value={formatPercent(kpis?.authRate)}
              badge="Live"
            />
            <HealthRow
              dotColor={kpis && kpis.fraudAlerts > 0 ? 'var(--amber)' : 'var(--green)'}
              label="Fraud Alerts"
              value={`${kpis?.fraudAlerts ?? 0} (30d)`}
              badge={kpis && kpis.fraudAlerts > 0 ? 'Review' : 'Clear'}
              badgeVariant={kpis && kpis.fraudAlerts > 0 ? 'ba' : 'bg'}
            />
            <HealthRow
              dotColor="var(--green)"
              label="Active Consumers"
              value={String(kpis?.activeConsumers ?? 0)}
              badge="30d"
            />
            <HealthRow
              dotColor={smsCredits < 1000 ? 'var(--amber)' : 'var(--green)'}
              label="SMS Credits"
              value={`${smsCredits.toLocaleString()} left`}
              badge={smsCredits < 1000 ? 'Low' : 'OK'}
              badgeVariant={smsCredits < 1000 ? 'ba' : 'bg'}
            />
            <HealthRow
              dotColor="var(--green)"
              label="PIN Credits"
              value={`${pinCredits.toLocaleString()} left`}
              badge="OK"
            />
          </div>
        </Card>
      </div>

      <div className="r2">
        <Card>
          <CardHeader title="Actions required" />
          {actions.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text3)', fontSize: 13 }}>No urgent actions right now.</div>
          ) : (
            <TableWrap minWidth={520}>
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Issue</th>
                    <th>Urgency</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((row) => (
                    <tr key={`${row.module}-${row.issue}`}>
                      <td>{row.module}</td>
                      <td>{row.issue}</td>
                      <td>
                        <Badge variant={row.urgency === 'High' ? 'br' : 'ba'}>{row.urgency}</Badge>
                      </td>
                      <td>
                        <Button variant="secondary" size="sm" onClick={() => navigateTo(row.path)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent batches" />
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>DORA</th>
                </tr>
              </thead>
              <tbody>
                {batchRows.slice(0, 5).map((b) => (
                  <tr key={b._id} className="cl" onClick={() => navigateTo(`/batches/detail?id=${b._id}`)}>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{b.id}</td>
                    <td>{b.product}</td>
                    <td>{b.qty}</td>
                    <td>
                      <Badge variant={b.doraVariant}>{b.dora}</Badge>
                    </td>
                  </tr>
                ))}
                {batchRows.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                      No batches yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}
