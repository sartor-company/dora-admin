import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { IntegrationBanner } from '../../components/ui/IntegrationBanner';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { TabBar } from '../../components/ui/TabBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { Toggle } from '../../components/ui/Toggle';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { giftPools, redemptions } from '../../data/mock';
import { useTabs } from '../../hooks/useTabs';

type GiftDetailTab = 'pools' | 'inventory' | 'redemptions' | 'analytics';

const TABS = [
  { id: 'pools' as const, label: 'Pools & Gifts' },
  { id: 'inventory' as const, label: 'Gift Inventory' },
  { id: 'redemptions' as const, label: 'Redemptions' },
  { id: 'analytics' as const, label: 'Analytics' },
];

export function GiftsDetailPage() {
  const { navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { active, setActive } = useTabs<GiftDetailTab>('pools');

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-gifts-list')}>← Back to Campaigns</BackLink>

      <div className="pghead">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="pgtitle">Welcome & Loyalty — Default</div>
            <span
              style={{
                display: 'inline-flex',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 4,
                background: 'var(--pb)',
                color: 'var(--pt)',
              }}
            >
              CLIENT_WIDE
            </span>
            <Badge variant="bg">Active</Badge>
          </div>
          <div className="pgsub">Brand-wide milestone programme · No end date · Jan 1, 2026</div>
        </div>
        <div className="pghead-actions" style={{ marginBottom: 0 }}>
          <Button variant="secondary" size="sm" onClick={() => openModal('pause-warn')}>
            ▮▮ Pause
          </Button>
          <Button variant="danger" size="sm" onClick={() => openModal('end-warn')}>
            ■ End Campaign
          </Button>
        </div>
      </div>

      <KCardGrid>
        <KCard label="Eligibility Events" value="892" trend="↑ 14% this month" trendType="up" />
        <KCard label="Codes Generated" value="867" trend="25 PENDING_STOCK" trendType="neu" />
        <KCard label="Redeemed" value="645" trend="72.4% rate" trendType="up" />
        <KCard label="Expired" value="43" trend="4.8% of issued" trendType="neu" />
      </KCardGrid>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as GiftDetailTab)} />

      {active === 'pools' && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
            Each pool fires independently on a qualifying authentication. All FIRST_AUTH pools are
            always exempt from stacking rules.
          </div>
          {giftPools.map((pool) => (
            <div
              key={pool.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: pool.headerBg,
                  padding: '13px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      padding: '3px 9px',
                      background: pool.triggerBg,
                      color: pool.triggerColor,
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {pool.trigger}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{pool.name}</div>
                  <div style={{ fontSize: 11, color: pool.activeLabelColor }}>{pool.subtitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: pool.activeLabelColor }}>{pool.activeLabel}</span>
                  <Toggle defaultOn />
                </div>
              </div>
              <div style={{ padding: '13px 16px' }}>
                <div className="pool-gifts-grid">
                  {pool.gifts.map((gift) => (
                    <div
                      key={gift.name}
                      style={{
                        background: 'var(--bg)',
                        borderRadius: 8,
                        padding: 12,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          background: 'var(--bg2)',
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {gift.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{gift.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                          {gift.description}
                        </div>
                        <div className="gift-mini-stats">
                          <div>
                            <div style={{ color: 'var(--text3)' }}>Remaining</div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: gift.remainingColor ?? 'var(--gt)',
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {gift.remaining}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text3)' }}>Issued</div>
                            <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                              {gift.issued}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text3)' }}>Weight</div>
                            <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                              {gift.weight}
                            </div>
                          </div>
                        </div>
                        {gift.showReplenish && (
                          <Button
                            variant="amber"
                            size="sm"
                            style={{ marginTop: 8, fontSize: 11 }}
                            onClick={() => openModal('replenish')}
                          >
                            + Replenish Stock
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    style={{
                      border: '1.5px dashed var(--border)',
                      borderRadius: 8,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      gap: 4,
                      color: 'var(--text3)',
                      background: 'transparent',
                      font: 'inherit',
                    }}
                    onClick={() => openModal('add-gift')}
                  >
                    <div style={{ fontSize: 24 }}>+</div>
                    <div style={{ fontSize: 12 }}>Add gift to pool</div>
                    <div style={{ fontSize: 11, textAlign: 'center' }}>
                      Multiple gifts = weighted random selection
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => showToast('Add new pool to this campaign')}>
            + Add Trigger Pool
          </Button>
        </>
      )}

      {active === 'inventory' && (
        <>
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bb)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--bt)',
              marginBottom: 14,
            }}
          >
            ℹ <strong>PENDING_STOCK:</strong> 25 consumers are waiting for gifts from Pool 2 (10th
            Scan). Replenish stock and click &ldquo;Release to Waitlist&rdquo; to assign gifts in
            chronological eligibility order.
          </div>
          <Card style={{ marginBottom: 12 }}>
            <CardHeader
              title="Pool 2 — 10th Scan Milestone (PENDING_STOCK: 25)"
              action={
                <Button size="sm" onClick={() => openModal('replenish')}>
                  + Replenish Stock
                </Button>
              }
            />
            <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Gift</th>
                  <th>Total Qty</th>
                  <th>Remaining</th>
                  <th>Issued</th>
                  <th>Redeemed</th>
                  <th>Weight</th>
                  <th>Live %</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { icon: '💳', name: '₦500 Store Credit', total: 500, remaining: 210, issued: 290, redeemed: 238, weight: '3.0', live: '60%' },
                  { icon: '💼', name: 'Free Delivery Voucher', total: 300, remaining: 87, issued: 213, redeemed: 187, weight: '2.0', live: '40%' },
                ].map((row) => (
                  <tr key={row.name}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          background: 'var(--bg2)',
                          borderRadius: 5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {row.icon}
                      </div>
                      <span>{row.name}</span>
                    </td>
                    <td>{row.total}</td>
                    <td style={{ fontWeight: 600, color: 'var(--gt)', fontFamily: "'DM Mono', monospace" }}>
                      {row.remaining}
                    </td>
                    <td>{row.issued}</td>
                    <td>{row.redeemed}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace" }}>{row.weight}</td>
                    <td>
                      <div
                        style={{
                          background: 'var(--bg)',
                          borderRadius: 4,
                          padding: '3px 7px',
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {row.live}
                      </div>
                    </td>
                    <td>
                      <Toggle defaultOn />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
            <div
              style={{
                padding: '10px 12px',
                background: 'var(--ab)',
                borderRadius: 7,
                fontSize: 12,
                color: 'var(--at)',
                marginTop: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>⚠ 25 consumers on PENDING_STOCK waitlist</span>
              <Button
                variant="amber"
                size="sm"
                onClick={() => showToast('Gifts assigned to 25 waiting consumers in chronological order')}
              >
                Release to Waitlist (25)
              </Button>
            </div>
          </Card>
          <Card>
            <CardHeader
              title="Pool 3 — Monthly Top 10 (Low Stock)"
              action={
                <Button size="sm" onClick={() => openModal('replenish')}>
                  + Replenish Stock
                </Button>
              }
            />
            <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Gift</th>
                  <th>Total Qty</th>
                  <th>Remaining</th>
                  <th>Issued</th>
                  <th>Redeemed</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        background: 'var(--bg2)',
                        borderRadius: 5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      🏋
                    </div>
                    <span>Premium Membership (1 month)</span>
                  </td>
                  <td>60</td>
                  <td style={{ fontWeight: 600, color: 'var(--at)', fontFamily: "'DM Mono', monospace" }}>
                    4
                  </td>
                  <td>56</td>
                  <td>51</td>
                  <td>
                    <Toggle defaultOn />
                  </td>
                </tr>
              </tbody>
            </table>
            </TableWrap>
          </Card>
        </>
      )}

      {active === 'redemptions' && (
        <>
          <IntegrationBanner
            variant="crm"
            label="Sartor CRM"
            description="Sales reps confirm physical redemptions in the CRM. Rep tracking, route management and fulfilment logging live there."
            href="https://crm.sartor.ng"
            linkText="Open CRM ↗"
          />
          <Card>
            <CardHeader
              title="Redemption Records"
              action={
                <Button variant="secondary" size="sm" onClick={() => showToast('CSV exported')}>
                  Export CSV
                </Button>
              }
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
              <input className="inp" style={{ flex: 1, minWidth: 120 }} placeholder="Search by consumer, gift, rep..." />
              <select className="inp" style={{ width: 140 }}>
                <option>All Pools</option>
                <option>FIRST_AUTH</option>
                <option>NTH_AUTH</option>
                <option>TOP_SCANNER</option>
              </select>
              <select className="inp" style={{ width: 140 }}>
                <option>All Statuses</option>
                <option>Redeemed</option>
                <option>Active</option>
                <option>Expired</option>
                <option>Pending Stock</option>
              </select>
            </div>
            <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Consumer</th>
                  <th>Gift</th>
                  <th>Pool</th>
                  <th>Rep</th>
                  <th>Method</th>
                  <th>Redeemed At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{r.consumer}</td>
                    <td>{r.gift}</td>
                    <td>
                      <Badge variant={r.poolVariant} style={{ fontSize: 10 }}>
                        {r.pool}
                      </Badge>
                    </td>
                    <td>{r.rep}</td>
                    <td>{r.method}</td>
                    <td>{r.redeemedAt}</td>
                    <td>
                      <Badge variant={r.statusVariant}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
          </Card>
        </>
      )}

      {active === 'analytics' && (
        <>
          <KCardGrid>
            <KCard label="Eligibility Events" value="892" />
            <KCard label="Codes Generated" value="867" trend="25 PENDING_STOCK" trendType="neu" />
            <KCard label="Redemption Rate" value="72.4%" trend="↑ 8%" trendType="up" />
            <KCard label="Expired Unredeemed" value="43" trend="4.8% of issued" trendType="neu" />
          </KCardGrid>
          <div className="r2">
            <LineChartCard title="Daily redemptions — last 30 days" />
            <Card>
              <CardHeader
                title="Top reps by redemption count"
                action={
                  <a
                    href="https://crm.sartor.ng"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 11, color: 'var(--bt)', fontWeight: 600 }}
                  >
                    View in CRM ↗
                  </a>
                }
              />
              <TableWrap>
            <table>
                <thead>
                  <tr>
                    <th>Rep</th>
                    <th>Role</th>
                    <th>Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rep: 'Mike Okonkwo', role: 'Sales Manager', count: 89 },
                    { rep: 'Ada Chukwu', role: 'Promoter', count: 74 },
                    { rep: 'Bola Adesanya', role: 'Merchandizer', count: 63 },
                    { rep: 'Chidi Kalu', role: 'Promoter', count: 58 },
                  ].map((row) => (
                    <tr key={row.rep}>
                      <td>{row.rep}</td>
                      <td>{row.role}</td>
                      <td style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </TableWrap>
            </Card>
          </div>
          <Card>
            <CardHeader title="Per-pool breakdown" />
            <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>Pool</th>
                  <th>Trigger</th>
                  <th>Events</th>
                  <th>Codes</th>
                  <th>Redeemed</th>
                  <th>Rate</th>
                  <th>PENDING_STOCK</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { pool: 'Pool 1 — Welcome Gift', trigger: 'FIRST_AUTH', triggerVariant: 'bg' as const, events: 352, codes: 352, redeemed: 290, rate: '82.4%', rateColor: 'var(--gt)', pending: '0', pendingColor: 'var(--text3)' },
                  { pool: 'Pool 2 — 10th Scan', trigger: 'NTH_AUTH', triggerVariant: 'bb' as const, events: 503, codes: 478, redeemed: 328, rate: '65.2%', rateColor: 'var(--at)', pending: '25', pendingColor: 'var(--at)' },
                  { pool: 'Pool 3 — Monthly Top 10', trigger: 'TOP_SCANNER', triggerVariant: 'ba' as const, events: 60, codes: 56, redeemed: 51, rate: '85.0%', rateColor: 'var(--gt)', pending: '0', pendingColor: 'var(--text3)' },
                ].map((row) => (
                  <tr key={row.pool}>
                    <td>{row.pool}</td>
                    <td>
                      <Badge variant={row.triggerVariant} style={{ fontSize: 10 }}>
                        {row.trigger}
                      </Badge>
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
      )}
    </>
  );
}
