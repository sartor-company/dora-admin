import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useTableFilter } from '../../hooks/useTableFilter';
import type { BadgeVariant } from '../../types';

const priorityLegend = [
  { label: 'P1', desc: 'Critical — immediate action' },
  { label: 'P2', desc: 'High — review within 24h' },
  { label: 'P3', desc: 'Standard — queue order' },
];

function PriorityBadge({ priority, color, size = 22 }: { priority: string; color: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: size === 22 ? 10 : 9,
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

export function InvQueuePage() {
  const { companyName, navigateWithQuery } = useApp();
  const { investigations, investigationStats, loading } = useTenantData();
  const openCases = investigations.filter((i) => i.status !== 'Closed');
  const { query, setQuery, filtered } = useTableFilter(openCases, ['id', 'flag', 'product', 'location', 'batch']);

  return (
    <>
      <PageHeader
        title="Investigation Queue"
        subtitle={companyName}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Badge variant="br" style={{ fontSize: 12, padding: '5px 9px' }}>
              {investigationStats?.queue ?? openCases.length} Open
            </Badge>
            <Badge variant="bg" style={{ fontSize: 12, padding: '5px 9px' }}>
              {investigationStats?.closed ?? 0} Closed
            </Badge>
          </div>
        }
      />

      <div className="invleg">
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Priority Order — DORA AI scoring</div>
        <div className="invgrid">
          {priorityLegend.map((item) => (
            <div key={item.label} className="invitem">
              <strong>{item.label}</strong> {item.desc}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <FilterBar>
          <input
            className="inp"
            placeholder="Search investigations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FilterBar>
        {loading && !investigations.length ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>Loading…</div>
        ) : (
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
                  <th>Status</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
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
                    <td>{inv.product}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--rt)' }}>
                      {inv.dora}
                    </td>
                    <td>
                      <Badge variant={inv.statusVariant as BadgeVariant}>{inv.status}</Badge>
                    </td>
                    <td>{inv.location}</td>
                    <td>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateWithQuery('/investigations/detail', { id: inv.id });
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>
                      No open investigations. Fraud alerts from analytics can be escalated here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
