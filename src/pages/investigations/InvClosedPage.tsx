import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { closedInvestigations } from '../../data/mock';
import { useTableFilter } from '../../hooks/useTableFilter';

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'var(--text3)',
        color: '#fff',
        fontSize: 10,
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

export function InvClosedPage() {
  const { navigateLegacy } = useApp();
  const { showToast } = useToast();
  const { query, setQuery, filtered } = useTableFilter(closedInvestigations, [
    'id',
    'flag',
    'product',
    'officer',
  ]);

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-inv-queue')}>
        ← Back to Investigation Queue
      </BackLink>

      <PageHeader
        title="Closed Investigations"
        subtitle="Resolved, cleared, and confirmed cases"
        actions={
          <Button variant="secondary" size="sm" onClick={() => showToast('CSV exported')}>
            Export CSV
          </Button>
        }
      />

      <KCardGrid columns={3}>
        <KCard
          label="Cleared (False Positive)"
          value="5"
          trend="Last 30 days"
          trendType="neu"
          style={{ borderLeft: '3px solid var(--green)' }}
        />
        <KCard
          label="Confirmed Counterfeit"
          value="3"
          trend="NAFDAC notified"
          trendType="dn"
          style={{ borderLeft: '3px solid var(--red)' }}
        />
        <KCard label="Total Closed (All Time)" value="31" trend="↑ 8 vs last month" trendType="up" />
      </KCardGrid>

      <Card>
        <FilterBar>
          <input
            className="inp"
            placeholder="Search closed cases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="inp">
            <option>All Outcomes</option>
            <option>Cleared</option>
            <option>Confirmed Counterfeit</option>
            <option>Referred to NAFDAC</option>
          </select>
          <select className="inp">
            <option>All Time</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </FilterBar>
        <TableWrap minWidth={800}>
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>ID</th>
              <th>Flag</th>
              <th>Batch</th>
              <th>Product</th>
              <th>DORA</th>
              <th>Outcome</th>
              <th>Closed</th>
              <th>Officer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <PriorityBadge priority={inv.priority} />
                </td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.id}</td>
                <td>
                  <Badge variant={inv.flagVariant}>{inv.flag}</Badge>
                </td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.batch}</td>
                <td>{inv.product}</td>
                <td
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    color: inv.dora < 35 ? 'var(--rt)' : 'var(--at)',
                  }}
                >
                  {inv.dora}
                </td>
                <td>
                  <Badge variant={inv.outcomeVariant}>{inv.outcome}</Badge>
                </td>
                <td>{inv.closed}</td>
                <td>{inv.officer}</td>
                <td>
                  <Button variant="secondary" size="sm" onClick={() => navigateLegacy('pg-inv-detail')}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableWrap>
      </Card>
    </>
  );
}
