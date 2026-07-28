import { useEffect, useState, type CSSProperties } from 'react';
import { analyticsApi } from '../../api/analytics';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import type { LoyaltyAnalytics } from '../../types/analytics';

function formatNum(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString();
}

function cohortCellStyle(pct: number | null): CSSProperties {
  if (pct == null) {
    return { textAlign: 'center', color: 'var(--text3)' };
  }
  const alpha = Math.max(0.22, Math.min(0.92, pct / 100));
  const textColor = pct >= 40 ? '#fff' : 'var(--text)';
  return {
    textAlign: 'center',
    fontWeight: 600,
    background: `rgba(13,122,78,${alpha.toFixed(2)})`,
    color: textColor,
  };
}

function agingBadge(age: string): 'bg' | 'ba' | 'br' {
  if (age.startsWith('Over')) return 'br';
  if (age.startsWith('31')) return 'ba';
  return 'bg';
}

export function BrandLoyaltyPage() {
  const { navigateTo, navigateWithQuery } = useApp();
  const [loyalty, setLoyalty] = useState<LoyaltyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    analyticsApi
      .loyalty(30)
      .then((data) => {
        if (!cancelled) setLoyalty(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoyalty(null);
          setError(e instanceof Error ? e.message : 'Failed to load loyalty.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = loyalty?.kpis;
  const points = loyalty?.pointsTriggers;
  const entitlements = loyalty?.entitlements;
  const cohorts = loyalty?.cohorts ?? [];

  const registeredTrend =
    kpis?.registeredTrendPct != null
      ? `↑ ${kpis.registeredTrendPct}% this month`
      : 'All authenticating consumers';

  const repeatTrend =
    kpis?.repeatRateCompare?.rate != null
      ? `↑ from ${kpis.repeatRateCompare.rate}% (${kpis.repeatRateCompare.label} cohort)`
      : 'Month-1 repeat authentication';

  return (
    <>
      <PageHeader
        title="Consumer Loyalty"
        subtitle="Retention, points economy and outstanding gift entitlements"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => navigateTo('/brand/consumers')}>
              Consumer Directory →
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigateTo('/gifts')}>
              Open Gift Engine →
            </Button>
          </div>
        }
      />

      {loading && !loyalty ? (
        <div style={{ padding: 24, color: 'var(--text3)' }}>Loading loyalty…</div>
      ) : error && !loyalty ? (
        <div style={{ padding: 24, color: 'var(--rt)' }}>{error}</div>
      ) : (
        <>
          <KCardGrid>
            <KCard
              label="Registered Consumers"
              value={formatNum(kpis?.registeredConsumers ?? 0)}
              trend={registeredTrend}
              trendType={kpis?.registeredTrendPct != null && kpis.registeredTrendPct > 0 ? 'up' : 'neu'}
            />
            <KCard
              label="Repeat Rate (Month 2)"
              value={kpis?.repeatRateMonth2 != null ? `${kpis.repeatRateMonth2}%` : '—'}
              trend={repeatTrend}
              trendType={kpis?.repeatRateMonth2 != null ? 'up' : 'neu'}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigateWithQuery('/brand/consumers', { filter: 'near' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateWithQuery('/brand/consumers', { filter: 'near' });
                }
              }}
              style={{ cursor: 'pointer' }}
              title="Open Consumer Directory filtered to these consumers"
            >
              <KCard
                label="Near Next Gift Trigger"
                value={formatNum(kpis?.nearNextGift ?? 0)}
                trend="Consumers at 90+ points → view"
                trendType="neu"
              />
            </div>
            <KCard
              label="Gifts Awaiting Collection"
              value={formatNum(kpis?.giftsAwaitingCollection ?? 0)}
              trend={
                kpis?.giftsAwaitingOver60d
                  ? `${kpis.giftsAwaitingOver60d} over 60 days`
                  : 'Outstanding entitlements'
              }
              trendType={kpis?.giftsAwaitingOver60d ? 'dn' : 'neu'}
            />
          </KCardGrid>

          <Card>
            <CardHeader
              title="Cohort retention — repeat authentication"
              action={<Badge variant="bb">% of each cohort that authenticated again</Badge>}
            />
            {cohorts.length === 0 ? (
              <div style={{ padding: 16, fontSize: 13, color: 'var(--text3)' }}>
                {loyalty?.cohortNote ||
                  'Cohort retention appears after consumers authenticate across multiple months.'}
              </div>
            ) : (
              <>
                <TableWrap minWidth={640}>
                  <table className="resp">
                    <thead>
                      <tr>
                        <th>First authenticated</th>
                        <th>Consumers</th>
                        {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((m) => (
                          <th key={m} style={{ textAlign: 'center' }}>
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map((row) => (
                        <tr key={row.key}>
                          <td data-label="Cohort">
                            <strong>{row.label}</strong>
                          </td>
                          <td
                            data-label="Consumers"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {formatNum(row.consumers)}
                          </td>
                          {row.months.map((pct, i) => (
                            <td
                              key={`${row.key}-m${i}`}
                              data-label={`M${i}`}
                              style={cohortCellStyle(pct)}
                            >
                              {pct == null ? '—' : `${pct}%`}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
                {loyalty?.cohortNote && (
                  <div
                    style={{
                      marginTop: 11,
                      padding: '9px 11px',
                      background: 'var(--bb)',
                      borderRadius: 7,
                      fontSize: 11.5,
                      color: 'var(--bt)',
                    }}
                  >
                    ℹ {loyalty.cohortNote}
                  </div>
                )}
              </>
            )}
          </Card>

          <div className="r2" style={{ marginTop: 14 }}>
            <Card>
              <CardHeader title="Points & gift triggers" />
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                {[
                  {
                    label: 'Authentications',
                    hint: 'Successful scratch-PIN verifications',
                    value: formatNum(points?.authentications ?? 0),
                  },
                  {
                    label: 'Points awarded',
                    hint: '10 points per authentication',
                    value: formatNum(points?.pointsAwarded ?? 0),
                  },
                  {
                    label: 'Consumers at 90+ points',
                    hint: 'One scan from their next gift',
                    value: formatNum(points?.nearNextGift ?? 0),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      borderRadius: 7,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{row.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{row.hint}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 11,
                  padding: '9px 11px',
                  background: 'var(--bb)',
                  borderRadius: 7,
                  fontSize: 11,
                  color: 'var(--bt)',
                }}
              >
                ℹ Points are awarded instantly at authentication and are{' '}
                <strong>not redeemable in themselves</strong> — they are the counter that fires a
                gift. Nothing is owed on points. A gift is owed on the <strong>first</strong>{' '}
                authentication and on every <strong>10th</strong> (each 100 points). The{' '}
                {formatNum(points?.nearNextGift ?? 0)} consumers above are the near-term demand
                signal for pool stock.
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Gift entitlements outstanding"
                action={<Badge variant="ba">The only consumer liability</Badge>}
              />
              <div style={{ display: 'grid', gap: 7, fontSize: 12.5 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 11px',
                    background: 'var(--bg)',
                    borderRadius: 6,
                  }}
                >
                  <span>Awarded at authentication</span>
                  <strong style={{ fontFamily: "'DM Mono', monospace" }}>
                    {formatNum(entitlements?.awarded ?? 0)}
                  </strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 11px',
                    background: 'var(--bg)',
                    borderRadius: 6,
                  }}
                >
                  <span>Redeemed with a rep</span>
                  <strong style={{ fontFamily: "'DM Mono', monospace", color: 'var(--gt)' }}>
                    {formatNum(entitlements?.redeemed ?? 0)}
                  </strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 11px',
                    background: '#FFF4DC',
                    borderRadius: 6,
                  }}
                >
                  <span style={{ color: '#8A5A00', fontWeight: 600 }}>Awaiting collection</span>
                  <strong style={{ fontFamily: "'DM Mono', monospace", color: '#8A5A00' }}>
                    {formatNum(entitlements?.awaiting ?? 0)}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  margin: '14px 0 7px',
                }}
              >
                Age since award
              </div>
              {(entitlements?.aging?.length ?? 0) === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>No outstanding gifts yet.</div>
              ) : (
                <TableWrap minWidth={280}>
                  <table className="resp">
                    <thead>
                      <tr>
                        <th>Age</th>
                        <th>Gifts</th>
                        <th>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(entitlements?.aging ?? []).map((row) => (
                        <tr key={row.age}>
                          <td data-label="Age">{row.age}</td>
                          <td data-label="Gifts">{row.gifts}</td>
                          <td data-label="Share">
                            <Badge variant={agingBadge(row.age)}>{row.share}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
                Median time from award to collection:{' '}
                <strong>
                  {entitlements?.medianDaysToCollection != null
                    ? `${entitlements.medianDaysToCollection} days`
                    : '—'}
                </strong>
                . Of the {formatNum(entitlements?.awaiting ?? 0)} outstanding,{' '}
                <strong>{formatNum(entitlements?.pendingStock ?? 0)}</strong> are{' '}
                <span style={{ fontFamily: "'DM Mono', monospace" }}>PENDING_STOCK</span> —
                entitlement held, awaiting restock.
              </div>
            </Card>
          </div>

          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bb)',
              borderRadius: 8,
              fontSize: 11.5,
              color: 'var(--bt)',
              marginTop: 14,
            }}
          >
            ℹ Gift-pool distribution and per-pool performance live under{' '}
            <button
              type="button"
              onClick={() => navigateTo('/gifts/analytics')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
                font: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Gift Engine → Analytics
            </button>
            . Consumer-level records, search and export are in{' '}
            <button
              type="button"
              onClick={() => navigateTo('/brand/consumers')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
                font: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Consumer Directory
            </button>
            .
          </div>
        </>
      )}
    </>
  );
}
