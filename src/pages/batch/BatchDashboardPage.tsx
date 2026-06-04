import { DonutChartCard } from '../../components/charts/DonutChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardLinkAction } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';

export function BatchDashboardPage() {
  const { companyName, navigateLegacy } = useApp();
  const { openModal } = useModal();

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
        <KCard label="Total Products" value="24" trend="↑ 2 this month" trendType="up" />
        <KCard label="Active Batches" value="12" trend="3 pending model" trendType="neu" />
        <KCard label="Scans (30d)" value="12.8K" trend="↑ 23%" trendType="up" />
        <KCard label="Auth Rate" value="97.4%" trend="↑ 1.2%" trendType="up" />
      </KCardGrid>

      <div className="r3">
        <LineChartCard title="Verification scans — last 30 days" />
        <DonutChartCard
          title="Batch status"
          data={[12, 3, 2]}
          colors={['#1DB87A', '#E8930A', '#6B3FD4']}
          legend={
            <div style={{ display: 'grid', gap: 3, marginTop: 7, fontSize: 11 }}>
              {[
                { label: 'Active', count: 12, color: 'var(--green)' },
                { label: 'Pending Model', count: 3, color: 'var(--amber)' },
                { label: 'Training', count: 2, color: 'var(--purple)' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: item.color,
                        display: 'inline-block',
                      }}
                    />
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
          <CardHeader
            title="Recent batches"
            action={<CardLinkAction onClick={() => navigateLegacy('pg-batch-list')}>View all →</CardLinkAction>}
          />
          <TableWrap>
          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Product</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Auths</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'BATCH-042', product: 'Sanitiser 500ml', status: 'Active', delivery: '18/25', auths: 234 },
                { id: 'BATCH-041', product: 'Carabiner Holder', status: 'Pending Model', delivery: 'Not sent', auths: '—', pending: true },
                { id: 'BATCH-037', product: 'Silicone Hook Pack', status: 'Active', delivery: 'All delivered', auths: 302 },
              ].map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{b.id}</td>
                  <td>{b.product}</td>
                  <td>
                    <Badge variant={b.pending ? 'ba' : 'bg'}>{b.status}</Badge>
                  </td>
                  <td>
                    <Badge variant={b.pending ? 'bx' : 'bg'} style={{ fontSize: 10 }}>
                      {b.delivery}
                    </Badge>
                  </td>
                  <td>{b.auths}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader title="Alerts" />
          <div style={{ display: 'grid', gap: 8 }}>
            <div
              style={{
                padding: 9,
                background: 'var(--ab)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--at)',
              }}
            >
              <strong>BATCH-041</strong> — Upload 1 clear reference image per side (front + back) to
              activate DORA model.
            </div>
            <div
              style={{
                padding: 9,
                background: 'var(--rb)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--rt)',
              }}
            >
              <strong>BATCH-038</strong> — Under investigation. Batch locked for loyalty points.
            </div>
            <div
              style={{
                padding: 9,
                background: 'var(--bb)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--bt)',
              }}
            >
              SMS credits at 41%. Consider purchasing more before month end.
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
