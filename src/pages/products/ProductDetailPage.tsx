import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { TabBar } from '../../components/ui/TabBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useTabs } from '../../hooks/useTabs';

type ProductTab = 'batches' | 'dora' | 'analytics' | 'licences';

const TABS = [
  { id: 'batches' as const, label: 'Batches' },
  { id: 'dora' as const, label: 'DORA Model' },
  { id: 'analytics' as const, label: 'Analytics' },
  { id: 'licences' as const, label: 'Licences' },
];

export function ProductDetailPage() {
  const { isReadOnly, navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { active, setActive } = useTabs<ProductTab>('batches');

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-products')}>← Back to Products</BackLink>

      <div className="pghead" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: 'var(--bg2)',
            borderRadius: 10,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'var(--text3)',
            flexShrink: 0,
          }}
        >
          IMG
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="pgtitle">Sartor Hand Sanitiser 500ml</div>
            <span
              style={{
                fontSize: 11,
                background: 'var(--gb)',
                color: 'var(--gt)',
                padding: '2px 7px',
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              GS1 ✓
            </span>
            <Badge variant="bg">Active</Badge>
          </div>
          <div className="pgsub">SKU: SHS-001 · Personal Care · 12 active batches</div>
        </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="https://verify.dorascan.ai"
            target="_blank"
            rel="noreferrer"
            className="btn bsec bsm"
          >
            ↗ Consumer Page
          </a>
          <Button variant="secondary" size="sm">
            ↓ Download QR
          </Button>
          {!isReadOnly && (
            <Button size="sm" onClick={() => openModal('product')}>
              Edit Product
            </Button>
          )}
        </div>
      </div>

      <KCardGrid>
        <KCard label="Total Scans" value="4,880" trend="↑ 12.4% vs last month" trendType="up" />
        <KCard label="Auth Rate" value="97.2%" trend="↑ 0.8%" trendType="up" />
        <KCard label="Active Batches" value="12" trend="2 in training" trendType="neu" />
        <KCard label="Open Investigations" value="1" trend="1 P1 open" trendType="dn" />
      </KCardGrid>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as ProductTab)} />

      {active === 'batches' && (
        <>
          {!isReadOnly && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Button size="sm" onClick={() => openModal('batch')}>
                + Create New Batch
              </Button>
            </div>
          )}
          <Card>
            <TableWrap minWidth={720}>
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Created</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Auths</th>
                  <th>Auth Rate</th>
                  <th>DORA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'BATCH-042', created: 'Apr 1, 2026', qty: 600, delivery: '18/25', auths: 234, rate: '41.3%' },
                  { id: 'BATCH-039', created: 'Mar 10, 2026', qty: 500, delivery: 'All delivered', auths: 310, rate: '62.0%' },
                  { id: 'BATCH-034', created: 'Feb 18, 2026', qty: 600, delivery: 'All delivered', auths: 581, rate: '96.8%', closed: true },
                ].map((b) => (
                  <tr
                    key={b.id}
                    className="cl"
                    onClick={() => navigateLegacy('pg-batch-detail')}
                  >
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{b.id}</td>
                    <td>{b.created}</td>
                    <td>{b.qty}</td>
                    <td>
                      <Badge variant={b.closed ? 'bx' : 'bg'}>{b.closed ? 'Closed' : 'Active'}</Badge>
                    </td>
                    <td>
                      <Badge variant="bg" style={{ fontSize: 10 }}>
                        {b.delivery}
                      </Badge>
                    </td>
                    <td>{b.auths}</td>
                    <td style={{ color: 'var(--gt)', fontWeight: 600 }}>{b.rate}</td>
                    <td>
                      <Badge variant="bg">Ready</Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateLegacy('pg-batch-detail');
                        }}
                      >
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
      )}

      {active === 'dora' && (
        <div className="r2">
          <Card>
            <CardHeader title="Active DORA Model" action={<Badge variant="bg">Deployed</Badge>} />
            <div
              style={{
                padding: 11,
                background: 'var(--gb)',
                borderRadius: 8,
                marginBottom: 12,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--gt)', marginBottom: 4 }}>
                Model v3 — Trained Apr 5, 2026
              </div>
              <div className="stack-2" style={{ color: 'var(--gt)' }}>
                <div>Training images: 2 (front + back)</div>
                <div>Inference time: &lt;200ms</div>
                <div>Last calibration: BATCH-042</div>
                <div>Calibrations remaining: 18</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              Consumer verification URL for this product:
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="inp"
                defaultValue="https://verify-sartorhealth.sartor.ng"
                readOnly
                style={{ flex: 1 }}
              />
              <a
                href="https://verify.dorascan.ai"
                target="_blank"
                rel="noreferrer"
                className="btn bsec bsm"
              >
                Preview ↗
              </a>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => openModal('dora')}>
                Retrain Model
              </Button>
              <Button variant="secondary" size="sm">
                ↓ Download QR Code
              </Button>
            </div>
          </Card>
          <Card>
            <div className="ct" style={{ marginBottom: 11 }}>
              Model History
            </div>
            <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
              {[
                { version: 'Model v3', status: 'Current', variant: 'bg' as const, desc: 'Trained Apr 5, 2026 · BATCH-042 reference', bg: 'var(--gb)', color: 'var(--gt)' },
                { version: 'Model v2', status: 'Retired', variant: 'bx' as const, desc: 'Trained Jan 14, 2026 · BATCH-031 reference', bg: 'var(--bg)', color: 'var(--text3)' },
                { version: 'Model v1', status: 'Retired', variant: 'bx' as const, desc: 'Trained Nov 2, 2025 · BATCH-018 reference', bg: 'var(--bg)', color: 'var(--text3)' },
              ].map((m) => (
                <div key={m.version} style={{ padding: 9, background: m.bg, borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <strong>{m.version}</strong>
                    <Badge variant={m.variant}>{m.status}</Badge>
                  </div>
                  <div style={{ color: m.color }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {active === 'analytics' && (
        <div className="r2">
          <LineChartCard
            title="Authentication trend — last 90 days"
            action={
              <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
                Export
              </Button>
            }
          />
          <Card>
            <div className="ct" style={{ marginBottom: 11 }}>
              Top scan locations
            </div>
            <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Scans</th>
                  <th>Auth Rate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { city: 'Lagos', scans: '2,140', rate: '97.8%' },
                  { city: 'Abuja', scans: '1,230', rate: '98.1%' },
                  { city: 'Ibadan', scans: '890', rate: '96.4%' },
                  { city: 'Aba', scans: '380', rate: '87.2%', color: 'var(--rt)' },
                ].map((row) => (
                  <tr key={row.city}>
                    <td>{row.city}</td>
                    <td>{row.scans}</td>
                    <td style={{ color: row.color ?? 'var(--gt)', fontWeight: 600 }}>{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
          </Card>
        </div>
      )}

      {active === 'licences' && (
        <Card>
          <CardHeader
            title="Regulatory Licences"
            action={
              !isReadOnly ? (
                <Button size="sm" onClick={() => openModal('product')}>
                  + Add Licence
                </Button>
              ) : undefined
            }
          />
          <TableWrap minWidth={560}>
          <table>
            <thead>
              <tr>
                <th>Authority</th>
                <th>Licence No.</th>
                <th>Market</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>NAFDAC</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>A7-0423L</td>
                <td>Nigeria</td>
                <td>Jan 1, 2024</td>
                <td>Dec 31, 2026</td>
                <td>
                  <Badge variant="bg">Active</Badge>
                </td>
              </tr>
              <tr>
                <td>SON</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>SON/RM/2023/0117</td>
                <td>Nigeria</td>
                <td>Mar 1, 2023</td>
                <td>Feb 28, 2027</td>
                <td>
                  <Badge variant="bg">Active</Badge>
                </td>
              </tr>
            </tbody>
          </table>
          </TableWrap>
        </Card>
      )}
    </>
  );
}
