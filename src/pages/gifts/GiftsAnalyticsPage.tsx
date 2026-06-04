import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';

export function GiftsAnalyticsPage() {
  const { navigateLegacy } = useApp();
  const { openModal } = useModal();

  return (
    <>
      <PageHeader
        title="Gift Engine Analytics"
        subtitle="Performance across all campaigns · All time"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="inp" style={{ width: 140 }}>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>All time</option>
            </select>
            <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
              Export
            </Button>
          </div>
        }
      />

      <KCardGrid>
        <KCard label="Total Eligibility Events" value="1,284" trend="↑ 23% vs last month" trendType="up" />
        <KCard label="Total Codes Generated" value="1,241" trend="96.7% fulfil rate" trendType="neu" />
        <KCard label="Overall Redemption Rate" value="72.4%" trend="↑ 8.2% vs last month" trendType="up" />
        <KCard label="PENDING_STOCK Events" value="25" trend="Pool 2 low stock" trendType="dn" />
      </KCardGrid>

      <div className="r2">
        <LineChartCard title="Daily redemptions — last 30 days" />
        <Card>
          <div className="ct" style={{ marginBottom: 11 }}>
            Trigger type breakdown
          </div>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div
              style={{
                padding: 10,
                background: 'var(--gb)',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--gt)' }}>FIRST_AUTH</div>
                <div style={{ color: 'var(--gt)' }}>352 events · 290 redeemed · 82.4% rate</div>
              </div>
              <Badge variant="bg">Highest rate</Badge>
            </div>
            <div
              style={{
                padding: 10,
                background: 'var(--bb)',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--bt)' }}>NTH_AUTH</div>
                <div style={{ color: 'var(--bt)' }}>
                  815 events · 543 redeemed · 66.6% rate · 25 PENDING_STOCK
                </div>
              </div>
              <Badge variant="ba">Low stock</Badge>
            </div>
            <div
              style={{
                padding: 10,
                background: 'var(--ab)',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--at)' }}>TOP_SCANNER</div>
                <div style={{ color: 'var(--at)' }}>117 events · 80 distributed · 68.4% rate</div>
              </div>
              <Badge variant="bg">On track</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Campaign performance comparison" />
        <TableWrap minWidth={720}>
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Events</th>
              <th>Codes</th>
              <th>Redeemed</th>
              <th>Rate</th>
              <th>PENDING</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Welcome & Loyalty — Default', scope: 'CLIENT_WIDE', scopeBg: 'var(--pb)', scopeColor: 'var(--pt)', events: 892, codes: 867, redeemed: 645, rate: '72.4%', rateColor: 'var(--gt)', pending: '25', pendingColor: 'var(--at)', clickable: true },
              { name: 'Sanitiser 500ml Launch Promo', scope: 'SKU_SPECIFIC', scopeBg: 'var(--bb)', scopeColor: 'var(--bt)', events: 312, codes: 296, redeemed: 228, rate: '74.0%', rateColor: 'var(--at)', pending: '0', pendingColor: 'var(--text3)', clickable: true },
              { name: 'Carabiner Bundle Reward', scope: 'SKU_SPECIFIC', scopeBg: 'var(--bb)', scopeColor: 'var(--bt)', events: 80, codes: 78, redeemed: 74, rate: '92.5%', rateColor: 'var(--gt)', pending: '0', pendingColor: 'var(--text3)', clickable: false },
            ].map((row) => (
              <tr
                key={row.name}
                className={row.clickable ? 'cl' : undefined}
                onClick={() => row.clickable && navigateLegacy('pg-gifts-detail')}
              >
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 5px',
                      borderRadius: 3,
                      background: row.scopeBg,
                      color: row.scopeColor,
                    }}
                  >
                    {row.scope}
                  </span>
                </td>
                <td>
                  <Badge variant="bg">Active</Badge>
                </td>
                <td>{row.events}</td>
                <td>{row.codes}</td>
                <td>{row.redeemed}</td>
                <td style={{ color: row.rateColor, fontWeight: 600 }}>{row.rate}</td>
                <td style={{ color: row.pendingColor, fontWeight: row.pending !== '0' ? 600 : undefined }}>
                  {row.pending}
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
