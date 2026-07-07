import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { giftsApi } from '../../api/gifts';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { IntegrationBanner } from '../../components/ui/IntegrationBanner';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { TabBar } from '../../components/ui/TabBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useTabs } from '../../hooks/useTabs';
import type { CampaignAnalytics, CampaignDetail, GiftRedemption } from '../../types/gifts';

type GiftDetailTab = 'pools' | 'inventory' | 'redemptions' | 'analytics';

const TABS = [
  { id: 'pools' as const, label: 'Pools & Gifts' },
  { id: 'inventory' as const, label: 'Gift Inventory' },
  { id: 'redemptions' as const, label: 'Redemptions' },
  { id: 'analytics' as const, label: 'Analytics' },
];

export function GiftsDetailPage() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id') || '';
  const { navigateTo, isReadOnly } = useApp();
  const { giftModalNonce } = useTenantData();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { active, setActive } = useTabs<GiftDetailTab>('pools');

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [redemptions, setRedemptions] = useState<GiftRedemption[]>([]);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const [detail, redemptionRows, campaignAnalytics] = await Promise.all([
        giftsApi.getCampaign(campaignId),
        giftsApi.listRedemptions({ campaignId }),
        giftsApi.campaignAnalytics(campaignId, 30),
      ]);
      setCampaign(detail);
      setRedemptions(redemptionRows);
      setAnalytics(campaignAnalytics);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [campaignId, showToast]);

  const openPauseModal = () => {
    if (!campaign) return;
    openModal('pause-warn', {
      campaignId: campaign._id,
      campaignName: campaign.name,
    });
  };

  const openEndModal = () => {
    if (!campaign) return;
    openModal('end-warn', {
      campaignId: campaign._id,
      campaignName: campaign.name,
      pendingStock: campaign.stats?.pendingStock,
    });
  };

  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    load();
  }, [campaignId, load, giftModalNonce]);

  const inventoryRows = useMemo(() => {
    if (!campaign) return [];
    return campaign.poolsDetail.flatMap((pool) =>
      pool.gifts.map((gift) => ({
        poolId: pool._id,
        poolName: pool.name,
        giftId: gift._id,
        icon: gift.icon,
        name: gift.name,
        total: gift.totalQty,
        remaining: gift.remaining,
        issued: gift.issued,
        redeemed: gift.redeemed,
        weight: gift.weight,
      })),
    );
  }, [campaign]);

  if (!campaignId) {
    return (
      <div style={{ padding: 24 }}>
        <BackLink onClick={() => navigateTo('/gifts')}>← Back to Campaigns</BackLink>
        <p style={{ marginTop: 16, color: 'var(--text3)' }}>No campaign selected.</p>
      </div>
    );
  }

  if (loading && !campaign) {
    return <div style={{ padding: 24, color: 'var(--text3)' }}>Loading campaign…</div>;
  }

  if (!campaign) {
    return (
      <div style={{ padding: 24 }}>
        <BackLink onClick={() => navigateTo('/gifts')}>← Back to Campaigns</BackLink>
        <p style={{ marginTop: 16, color: 'var(--text3)' }}>Campaign not found.</p>
      </div>
    );
  }

  const stats = campaign.stats;
  const canManage = !isReadOnly && campaign.status === 'ACTIVE';

  return (
    <>
      <BackLink onClick={() => navigateTo('/gifts')}>← Back to Campaigns</BackLink>

      <div className="pghead">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="pgtitle">{campaign.name}</div>
            <span
              style={{
                display: 'inline-flex',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 4,
                background: campaign.scope === 'CLIENT_WIDE' ? 'var(--pb)' : 'var(--bb)',
                color: campaign.scope === 'CLIENT_WIDE' ? 'var(--pt)' : 'var(--bt)',
              }}
            >
              {campaign.scope}
            </span>
            <Badge variant={campaign.statusVariant}>{campaign.statusLabel}</Badge>
          </div>
          <div className="pgsub">
            {campaign.description || 'Gift campaign'} · {campaign.dateStart}
            {campaign.dateEnd ? ` – ${campaign.dateEnd}` : ' · No end date'}
          </div>
        </div>
        {canManage && (
          <div className="pghead-actions" style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={openPauseModal}>
                ▮▮ Pause
              </Button>
              <Button variant="danger" size="sm" onClick={openEndModal}>
                ■ End Campaign
              </Button>
            </div>
          </div>
        )}
      </div>

      <KCardGrid>
        <KCard label="Eligibility Events" value={String(stats.eligible)} trend="Live" trendType="up" />
        <KCard
          label="Codes Generated"
          value={String(stats.eligible)}
          trend={`${stats.pendingStock} PENDING_STOCK`}
          trendType="neu"
        />
        <KCard
          label="Redeemed"
          value={String(stats.redeemed)}
          trend={`${stats.redemptionRate}% rate`}
          trendType="up"
        />
        <KCard label="Expired" value={String(stats.expired)} trend="From redemptions" trendType="neu" />
      </KCardGrid>

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as GiftDetailTab)} />

      {active === 'pools' && (
        <>
          {campaign.poolsDetail.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text3)' }}>
              No pools configured. Activate a draft with pools from the campaign wizard.
            </div>
          ) : (
            campaign.poolsDetail.map((pool) => (
              <div
                key={pool._id}
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
                  <span style={{ fontSize: 11, color: pool.activeLabelColor }}>{pool.activeLabel}</span>
                  {!isReadOnly && campaign.status !== 'ENDED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        openModal('add-gift', {
                          campaignId: campaign._id,
                          poolId: pool._id,
                          poolName: pool.name,
                        })
                      }
                    >
                      + Add gift
                    </Button>
                  )}
                </div>
                <div style={{ padding: '13px 16px' }}>
                  <div className="pool-gifts-grid">
                    {pool.gifts.map((gift) => (
                      <div
                        key={gift._id}
                        style={{
                          background: 'var(--bg)',
                          borderRadius: 8,
                          padding: 12,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 20 }}>{gift.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{gift.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                            {gift.description || '—'}
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
                          {!isReadOnly && campaign.status !== 'ENDED' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                openModal('replenish', {
                                  campaignId: campaign._id,
                                  poolId: pool._id,
                                  giftId: gift._id,
                                  giftName: gift.name,
                                  poolName: pool.name,
                                  remaining: gift.remaining,
                                })
                              }
                            >
                              Replenish
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {active === 'inventory' && (
        <Card>
          <CardHeader title="Gift inventory across pools" />
          {inventoryRows.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text3)' }}>No gift items in this campaign.</div>
          ) : (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th>Gift</th>
                    <th>Pool</th>
                    <th>Total</th>
                    <th>Remaining</th>
                    <th>Issued</th>
                    <th>Redeemed</th>
                    <th>Weight</th>
                    {!isReadOnly && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {inventoryRows.map((row) => (
                    <tr key={row.giftId}>
                      <td>
                        {row.icon} {row.name}
                      </td>
                      <td>{row.poolName}</td>
                      <td>{row.total}</td>
                      <td>{row.remaining}</td>
                      <td>{row.issued}</td>
                      <td>{row.redeemed}</td>
                      <td>{row.weight}</td>
                      {!isReadOnly && (
                        <td>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              openModal('replenish', {
                                campaignId: campaign!._id,
                                poolId: row.poolId,
                                giftId: row.giftId,
                                giftName: row.name,
                                poolName: row.poolName,
                                remaining: row.remaining,
                              })
                            }
                          >
                            Replenish
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      )}

      {active === 'redemptions' && (
        <>
          <IntegrationBanner
            variant="crm"
            label="Sartor CRM"
            description="Physical gift fulfilment is managed in Sartor CRM when CRM is enabled for your tenant."
            href="https://crm.sartor.ng"
            linkText="Open CRM ↗"
          />
          <Card>
            {redemptions.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--text3)' }}>
                No redemptions yet. They appear when consumers qualify for gifts.
              </div>
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>Consumer</th>
                      <th>Gift</th>
                      <th>Pool</th>
                      <th>Rep</th>
                      <th>Method</th>
                      <th>Redeemed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((r) => (
                      <tr key={r._id}>
                        <td>{r.consumer}</td>
                        <td>{r.gift}</td>
                        <td>
                          <Badge variant={r.poolVariant}>{r.pool}</Badge>
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
            )}
          </Card>
        </>
      )}

      {active === 'analytics' && (
        <>
          <div className="r2">
            <LineChartCard
              title="Daily redemptions — last 30 days"
              labels={analytics?.chart.labels}
              data={analytics?.chart.data}
            />
          </div>
          <Card style={{ marginTop: 12 }}>
            <CardHeader title="Per-pool breakdown" />
            {(analytics?.poolBreakdown.length ?? 0) === 0 ? (
              <div style={{ padding: 16, color: 'var(--text3)' }}>No pool activity in this period.</div>
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>Pool</th>
                      <th>Trigger</th>
                      <th>Events</th>
                      <th>Redeemed</th>
                      <th>Rate</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.poolBreakdown.map((row) => (
                      <tr key={row.pool}>
                        <td>{row.pool}</td>
                        <td>
                          <Badge variant={row.triggerVariant}>{row.trigger}</Badge>
                        </td>
                        <td>{row.events}</td>
                        <td>{row.redeemed}</td>
                        <td>{row.rate}</td>
                        <td>{row.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>
        </>
      )}
    </>
  );
}
