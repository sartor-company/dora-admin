import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardLinkAction } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { investigations } from '../../data/mock';

function PriorityBadge({ priority, color }: { priority: string; color: string }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: 9,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {priority}
    </span>
  );
}

export function InvDashboardPage() {
  const { companyName, navigateLegacy } = useApp();

  return (
    <>
      <PageHeader
        title="Investigation Dashboard"
        subtitle={`${companyName} · DORA AI flagged cases`}
      />

      <KCardGrid>
        <KCard
          label="Open Investigations"
          value="4"
          trend="↑ 2 new this week"
          trendType="dn"
          style={{ borderLeft: '3px solid var(--red)' }}
        />
        <KCard
          label="Under Review"
          value="1"
          trend="Awaiting decision"
          trendType="neu"
          style={{ borderLeft: '3px solid var(--amber)' }}
        />
        <KCard
          label="Resolved (30d)"
          value="8"
          trend="5 cleared, 3 confirmed"
          trendType="up"
          style={{ borderLeft: '3px solid var(--green)' }}
        />
        <KCard label="Fraud Patterns" value="3" trend="Bimodal + Lab + Regional" trendType="dn" />
      </KCardGrid>

      <div className="r2">
        <Card>
          <CardHeader
            title="Priority queue"
            action={
              <CardLinkAction onClick={() => navigateLegacy('pg-inv-queue')}>
                View all →
              </CardLinkAction>
            }
          />
          <TableWrap minWidth={520}>
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>ID</th>
                <th>Flag</th>
                <th>DORA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((inv) => (
                <tr
                  key={inv.id}
                  className="cl"
                  onClick={() => navigateLegacy('pg-inv-detail')}
                >
                  <td>
                    <PriorityBadge priority={inv.priority} color={inv.priorityColor} />
                  </td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.id}</td>
                  <td>
                    <Badge variant={inv.flagVariant}>{inv.flag}</Badge>
                  </td>
                  <td style={{ color: 'var(--rt)', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {inv.dora}
                  </td>
                  <td>
                    <Badge variant={inv.statusVariant}>{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader title="Fraud pattern alerts" />
          <div style={{ display: 'grid', gap: 7 }}>
            <div
              style={{
                padding: 9,
                background: 'var(--rb)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--rt)',
              }}
            >
              <strong>CRITICAL · Bimodal Distribution</strong>
              <br />
              BATCH-042 · 8.0% warning rate · Aba zone
            </div>
            <div
              style={{
                padding: 9,
                background: 'var(--ab)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--at)',
              }}
            >
              <strong>HIGH · Lab Scan Detection</strong>
              <br />
              BATCH-038 · 5 scans in 7 days, avg DORA 32
            </div>
            <div
              style={{
                padding: 9,
                background: 'var(--ab)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--at)',
              }}
            >
              <strong>MEDIUM · Regional Divergence</strong>
              <br />
              BATCH-037 · Kano region 4.7% warning rate
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
