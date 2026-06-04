import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { HealthRow } from '../../components/ui/HealthRow';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { actionsRequired, teamActivity } from '../../data/mock';

export function OwnerDashboardPage() {
  const { clientType, companyName, navigateLegacy } = useApp();
  const { openModal } = useModal();

  return (
    <>
      {clientType === 'pilot' && (
        <div
          style={{
            padding: '13px 16px',
            background: '#fff8f6',
            border: '2px solid #FF5C35',
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <div className="pilot-banner-inner">
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#D64000', marginBottom: 4 }}>
                🎓 You are on a Pilot Programme
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                90-day trial · Started Apr 19, 2026 ·{' '}
                <strong style={{ color: 'var(--at)' }}>82 days remaining</strong> · 1 SKU · Full
                platform access
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                Your DORA models, consumer data, and loyalty points will carry forward automatically
                if you convert to Full Deployment.
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <Button
                style={{ background: '#D64000', color: '#fff', marginBottom: 5 }}
                onClick={() => openModal('convert-deployment')}
              >
                Convert to Full Deployment
              </Button>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                Effective cost: ₦1,000,000
                <br />
                (after ₦3,500,000 pilot credit)
              </div>
            </div>
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
        <KCard label="Total Products" value="24" trend="↑ 2 this month" trendType="up" />
        <KCard label="Active Batches" value="12" trend="3 pending model" trendType="neu" />
        <KCard label="Auth Rate (30d)" value="97.4%" trend="↑ 1.2%" trendType="up" />
        <KCard label="Open Investigations" value="4" trend="↑ 2 this week" trendType="dn" />
      </KCardGrid>

      <div className="r2">
        <LineChartCard title="Scan volume — last 30 days" />
        <Card>
          <CardHeader title="Platform health" />
          <div>
            <HealthRow dotColor="var(--green)" label="Authentication Rate" value="97.4%" badge="Green" />
            <HealthRow dotColor="var(--amber)" label="Fraud Alerts" value="3 active" badge="Amber" badgeVariant="ba" />
            <HealthRow dotColor="var(--green)" label="Consumer Loyalty" value="4,218" badge="↑ 18.7%" />
            <HealthRow dotColor="var(--amber)" label="SMS Credits" value="5,876 left" badge="41%" badgeVariant="ba" />
            <HealthRow dotColor="var(--green)" label="Batch Operations" value="12 active" badge="Green" />
          </div>
        </Card>
      </div>

      <div className="r2">
        <Card>
          <CardHeader title="Actions required" />
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
              {actionsRequired.map((row) => (
                <tr key={row.module}>
                  <td>{row.module}</td>
                  <td>{row.issue}</td>
                  <td>
                    <Badge variant={row.urgencyVariant}>{row.urgency}</Badge>
                  </td>
                  <td>
                    <Button
                      variant={row.variant === 'danger' ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => navigateLegacy(row.pageId)}
                    >
                      {row.actionLabel}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader title="Team activity" />
          <div style={{ display: 'grid', gap: 7 }}>
            {teamActivity.map((item) => (
              <div
                key={item.name}
                style={{
                  padding: 9,
                  background: item.alert ? 'var(--rb)' : 'var(--bg)',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <strong>{item.name}</strong>
                  <span style={{ color: 'var(--text3)' }}>{item.role}</span>
                </div>
                <div style={{ color: item.alert ? 'var(--rt)' : 'var(--text2)' }}>{item.action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
