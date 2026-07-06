import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardLinkAction } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import type { BadgeVariant } from '../../types';

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
  const { companyName, navigateLegacy, navigateWithQuery } = useApp();
  const { investigations, investigationStats } = useTenantData();
  const open = investigations.filter((i) => i.status !== 'Closed');
  const inReview = investigations.filter((i) => i.status === 'In Progress');

  return (
    <>
      <PageHeader title="Investigation Dashboard" subtitle={`${companyName} · DORA AI flagged cases`} />

      <KCardGrid>
        <KCard
          label="Open Investigations"
          value={String(investigationStats?.queue ?? open.length)}
          trend={`${investigationStats?.p1 ?? 0} critical`}
          trendType="dn"
          style={{ borderLeft: '3px solid var(--red)' }}
        />
        <KCard
          label="Under Review"
          value={String(inReview.length)}
          trend="Assigned cases"
          trendType="neu"
          style={{ borderLeft: '3px solid var(--amber)' }}
        />
        <KCard
          label="Resolved"
          value={String(investigationStats?.closed ?? 0)}
          trend="Closed cases"
          trendType="up"
          style={{ borderLeft: '3px solid var(--green)' }}
        />
        <KCard label="P1 Critical" value={String(investigationStats?.p1 ?? 0)} trend="Requires immediate action" trendType="dn" />
      </KCardGrid>

      <div className="r2">
        <Card>
          <CardHeader
            title="Priority queue"
            action={<CardLinkAction onClick={() => navigateLegacy('pg-inv-queue')}>View all →</CardLinkAction>}
          />
          <TableWrap minWidth={520}>
            <table>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>ID</th>
                  <th>Flag</th>
                  <th>Batch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {open.slice(0, 6).map((inv) => (
                  <tr
                    key={inv.id}
                    className="cl"
                    onClick={() => navigateWithQuery('/investigations/detail', { id: inv.id })}
                  >
                    <td>
                      <PriorityBadge priority={inv.priority} color={inv.priorityColor} />
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.id}</td>
                    <td>
                      <Badge variant={inv.flagVariant as BadgeVariant}>{inv.flag}</Badge>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.batch}</td>
                    <td>
                      <Badge variant={inv.statusVariant as BadgeVariant}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
                {!open.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>
                      No open cases
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
