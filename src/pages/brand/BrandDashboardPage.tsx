import { DonutChartCard } from '../../components/charts/DonutChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardLinkAction } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';

export function BrandDashboardPage() {
  const { companyName, navigateLegacy } = useApp();
  const { openModal } = useModal();

  return (
    <>
      <PageHeader
        title="Brand Dashboard"
        subtitle={`${companyName} · Authentication & loyalty analytics`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="inp" style={{ width: 130 }}>
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
            <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
              Export
            </Button>
          </div>
        }
      />

      <RestrictBanner>
        🔒 Read-only. Contact your Batch Admin to add or modify products and batches.
      </RestrictBanner>

      <KCardGrid>
        <KCard label="Total Scans (30d)" value="12.8K" trend="↑ 23%" trendType="up" />
        <KCard label="Auth Rate" value="97.4%" trend="↑ 1.2%" trendType="up" />
        <KCard label="Active Consumers" value="4,218" trend="↑ 18.7%" trendType="up" />
        <KCard label="Fraud Alerts" value="3" trend="↑ 1 this week" trendType="dn" />
      </KCardGrid>

      <div className="r3">
        <LineChartCard title="Scan volume — last 30 days" />
        <DonutChartCard
          title="Result breakdown"
          data={[97.4, 1.9, 0.7]}
          colors={['#1DB87A', '#E8930A', '#D63B3B']}
          legend={
            <div style={{ display: 'grid', gap: 3, marginTop: 7, fontSize: 11 }}>
              {[
                { label: 'Authentic', pct: '97.4%', color: 'var(--green)' },
                { label: 'Uncertain', pct: '1.9%', color: 'var(--amber)' },
                { label: 'Warning+', pct: '0.7%', color: 'var(--red)' },
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
                  <strong>{item.pct}</strong>
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
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { product: 'Sanitiser 500ml', scans: '4,880', rate: '97.2%', trend: '↑ 1.4%', up: true },
                { product: 'Carabiner Holder', scans: '2,457', rate: '98.1%', trend: '↑ 0.8%', up: true },
                { product: 'Silicone Hook Pack', scans: '1,892', rate: '96.8%', trend: '↑ 2.1%', up: true },
                { product: 'Sanitiser 250ml', scans: '980', rate: '91.2%', trend: '↓ 0.4%', up: false },
              ].map((row) => (
                <tr key={row.product}>
                  <td>{row.product}</td>
                  <td>{row.scans}</td>
                  <td style={{ color: row.up ? 'var(--gt)' : 'var(--at)', fontWeight: 600 }}>
                    {row.rate}
                  </td>
                  <td className={row.up ? 'up' : 'dn'}>{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader
            title="Consumer loyalty"
            action={
              <CardLinkAction onClick={() => navigateLegacy('pg-brand-loyalty')}>
                Details →
              </CardLinkAction>
            }
          />
          <div style={{ display: 'grid', gap: 7, fontSize: 12 }}>
            {[
              { label: 'Points Issued (30d)', value: '21,340' },
              { label: 'Points Redeemed', value: '9,120' },
              { label: 'Redemption Rate', value: '42.8%', color: 'var(--gt)' },
              { label: 'New Registrations', value: '634' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 7,
                  background: 'var(--bg)',
                  borderRadius: 6,
                }}
              >
                <span>{item.label}</span>
                <strong style={{ fontFamily: "'DM Mono', monospace", color: item.color }}>
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
