import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { downloadCsv, downloadPdfReport } from '../../utils/export';
import { useTableFilter } from '../../hooks/useTableFilter';
import type { BadgeVariant } from '../../types';

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
  const { navigateLegacy, companyName } = useApp();
  const { investigations } = useTenantData();
  const closed = investigations.filter((i) => i.status === 'Closed');
  const { query, setQuery, filtered } = useTableFilter(closed, ['id', 'flag', 'product', 'officer']);

  const exportCsv = () => {
    downloadCsv(
      'closed-investigations.csv',
      ['ID', 'Severity', 'Batch', 'Product', 'Outcome', 'Closed', 'Officer'],
      filtered.map((i) => [i.id, i.flag, i.batch, i.product, i.outcome || '—', i.closed || '—', i.officer || '—']),
    );
  };

  const exportPdf = () => {
    downloadPdfReport({
      title: 'Closed Investigations',
      company: companyName,
      headers: ['ID', 'Severity', 'Batch', 'Product', 'Outcome', 'Closed'],
      rows: filtered.map((i) => [i.id, i.flag, i.batch, i.product, i.outcome || '—', i.closed || '—']),
      summary: [{ label: 'Closed cases', value: String(filtered.length) }],
    });
  };

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-inv-queue')}>← Back to Investigation Queue</BackLink>

      <PageHeader
        title="Closed Investigations"
        subtitle="Resolved, cleared, and confirmed cases"
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportPdf}>
              Export PDF
            </Button>
          </div>
        }
      />

      <Card>
        <FilterBar>
          <input className="inp" placeholder="Search closed cases…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </FilterBar>
        <TableWrap minWidth={720}>
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>ID</th>
                <th>Flag</th>
                <th>Batch</th>
                <th>Product</th>
                <th>Outcome</th>
                <th>Closed</th>
                <th>Officer</th>
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
                    <Badge variant={inv.flagVariant as BadgeVariant}>{inv.flag}</Badge>
                  </td>
                  <td>{inv.batch}</td>
                  <td>{inv.product}</td>
                  <td>
                    <Badge variant={(inv.outcomeVariant as BadgeVariant) || 'bg'}>{inv.outcome || '—'}</Badge>
                  </td>
                  <td>{inv.closed || '—'}</td>
                  <td>{inv.officer || '—'}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>
                    No closed investigations yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}
