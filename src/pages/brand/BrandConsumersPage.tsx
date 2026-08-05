import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { consumersApi } from '../../api/consumers';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useToast } from '../../context/ToastContext';
import type {
  ConsumerDetail,
  ConsumerDirectoryKpis,
  ConsumerListItem,
  ConsumerStatus,
} from '../../types/consumers';
import { downloadCsv } from '../../utils/export';

function statusVariant(s: ConsumerStatus): 'bg' | 'br' | 'bx' {
  if (s === 'Active') return 'bg';
  if (s === 'Flagged') return 'br';
  return 'bx';
}

function PointsBar({ points, progress }: { points: number; progress: number }) {
  const near = progress >= 90;
  return (
    <div>
      <strong>{points}</strong> pts
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
        <div
          style={{
            flex: 1,
            minWidth: 40,
            height: 5,
            background: 'var(--border)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: near ? 'var(--at)' : 'var(--navy)',
            }}
          />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "'DM Mono', monospace" }}>
          {progress}/100
        </span>
      </div>
    </div>
  );
}

export function BrandConsumersPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState<ConsumerDirectoryKpis | null>(null);
  const [rows, setRows] = useState<ConsumerListItem[]>([]);
  const [note, setNote] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [filter, setFilter] = useState(
    initialFilter === 'near' || initialFilter === 'near-gift' ? 'near' : initialFilter || '',
  );
  const [reveal, setReveal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<ConsumerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [missingFullPhone, setMissingFullPhone] = useState(0);
  const warnedMissingPhone = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await consumersApi.list({
        q: q || undefined,
        status: status !== 'All Statuses' ? status : undefined,
        filter: filter || undefined,
        reveal,
      });
      setKpis(res.kpis);
      setRows(res.data || []);
      setNote(res.note || '');
      setMissingFullPhone(res.revealMeta?.withoutFullPhone ?? 0);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load consumers.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q, status, filter, reveal]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 200);
    return () => window.clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (initialFilter === 'near' || initialFilter === 'near-gift') {
      showToast('Directory filtered to consumers one scan from their next gift.', 'success');
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const selectedCount = selected.size;

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(visibleIds));
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleReveal = async () => {
    if (!reveal) {
      try {
        await consumersApi.revealPii('Consumer Directory PII reveal toggle');
        warnedMissingPhone.current = false;
        setReveal(true);
        showToast('Full phone numbers and emails revealed — this action is audit-logged.', 'warn');
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not audit PII reveal.');
      }
      return;
    }
    setReveal(false);
    warnedMissingPhone.current = false;
    showToast('PII hidden again.', 'success');
  };

  useEffect(() => {
    if (!reveal || loading || warnedMissingPhone.current) return;
    if (missingFullPhone > 0) {
      warnedMissingPhone.current = true;
      showToast(
        `${missingFullPhone} consumer(s) only have a masked phone on file. Full number appears after they authenticate again.`,
        'warn',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal, loading, missingFullPhone]);

  const exportCsv = async () => {
    try {
      const payload = await consumersApi.export({
        ids: selectedCount ? [...selected] : undefined,
        q: q || undefined,
        status: status !== 'All Statuses' ? status : undefined,
        filter: filter || undefined,
        reveal,
      });
      if (!payload.count) {
        showToast('No consumers match — nothing to export.', 'warn');
        return;
      }
      const stamp = new Date().toISOString().slice(0, 10);
      const scope = selectedCount ? 'selected' : 'filtered';
      downloadCsv(`sartor-consumers-${scope}-${stamp}.csv`, payload.headers, payload.rows);
      showToast(`Exported ${payload.count} consumer record(s) — export is audit-logged.`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Export failed.');
    }
  };

  const viewConsumer = async (id: string) => {
    setDetailLoading(true);
    try {
      const d = await consumersApi.get(id, reveal);
      setDetail(d);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load consumer.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Consumer Directory"
        subtitle="Consumers who authenticated your products · loyalty, gifts & reports"
      />

      <KCardGrid>
        <KCard
          label="Registered Consumers"
          value={String(kpis?.registeredConsumers ?? 0)}
          trend="All authenticating consumers"
          trendType="up"
        />
        <KCard
          label="Total Points Issued"
          value={String(kpis?.totalPointsIssued ?? 0)}
          trend="Across all consumers"
          trendType="neu"
        />
        <KCard
          label="Gifts Redeemed"
          value={String(kpis?.giftsRedeemed ?? 0)}
          trend="Matched gift redemptions"
          trendType="up"
        />
        <KCard
          label="Consumer Reports"
          value={String(kpis?.consumerReports ?? 0)}
          trend={`${kpis?.nearNextGift ?? 0} near next gift`}
          trendType={kpis && kpis.consumerReports > 0 ? 'dn' : 'neu'}
        />
      </KCardGrid>

      <Card className="consumers-card">
        <div className="consumers-toolbar">
          <div className="consumers-toolbar__title">
            <div className="ct">Consumer records</div>
            <div className="consumers-toolbar__meta">
              {selectedCount ? `${selectedCount} selected` : 'None selected'}
              {reveal ? ' · PII visible' : ' · PII masked'}
              {reveal && missingFullPhone > 0
                ? ` · ${missingFullPhone} phone(s) not fully stored yet`
                : ''}
            </div>
          </div>
          <div className="consumers-toolbar__actions">
            <Button variant="secondary" size="sm" onClick={() => void toggleReveal()}>
              {reveal ? 'Hide full PII' : 'Reveal full PII'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void exportCsv()}>
              Export CSV
            </Button>
          </div>
        </div>

        <FilterBar className="consumers-filters">
          <input
            className="inp consumers-filters__search"
            placeholder="Search name, phone or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search consumers"
          />
          <select
            className="inp"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Dormant</option>
            <option>Flagged</option>
          </select>
          <select
            className="inp"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by activity"
          >
            <option value="">All Consumers</option>
            <option value="near">Near next gift (90+ pts)</option>
            <option value="has-gifts">Has gifts won</option>
            <option value="unredeemed">Has unredeemed gifts</option>
            <option value="reports">Has counterfeit reports</option>
          </select>
        </FilterBar>

        {loading ? (
          <div style={{ padding: 20, color: 'var(--text3)' }}>Loading consumers…</div>
        ) : error ? (
          <div style={{ padding: 20, color: 'var(--rt)' }}>{error}</div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="consumers-table-desk">
              <TableWrap minWidth={880}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 34 }}>
                        <input
                          type="checkbox"
                          checked={rows.length > 0 && selectedCount === rows.length}
                          onChange={(e) => toggleAll(e.target.checked)}
                          aria-label="Select all consumers"
                        />
                      </th>
                      <th>Consumer</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Auths</th>
                      <th>Points / Next gift</th>
                      <th>Gifts</th>
                      <th>Reports</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={(e) => toggleOne(r.id, e.target.checked)}
                            aria-label={`Select ${r.name}`}
                          />
                        </td>
                        <td>
                          <strong>{r.name}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Joined {r.joined}</div>
                        </td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{r.phone}</td>
                        <td style={{ fontSize: 11, wordBreak: 'break-all' }}>{r.email}</td>
                        <td>{r.authentications}</td>
                        <td>
                          <PointsBar points={r.points} progress={r.progressToNextGift} />
                        </td>
                        <td>
                          {r.giftsWon}
                          <span style={{ color: 'var(--text3)', fontSize: 11 }}> / {r.giftsRedeemed} rdm</span>
                        </td>
                        <td>
                          {r.reports ? (
                            <Badge variant="br">{r.reports}</Badge>
                          ) : (
                            <span style={{ color: 'var(--text3)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        </td>
                        <td>
                          <Button size="sm" variant="secondary" onClick={() => void viewConsumer(r.id)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text3)', padding: 18 }}>
                          No consumers match your search or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </TableWrap>
            </div>

            {/* Mobile card list */}
            <div className="consumers-mobile-list">
              {rows.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 18 }}>
                  No consumers match your search or filters.
                </div>
              ) : (
                rows.map((r) => (
                  <article key={r.id} className="consumers-mobile-card">
                    <div className="consumers-mobile-card__top">
                      <label className="consumers-mobile-card__check">
                        <input
                          type="checkbox"
                          checked={selected.has(r.id)}
                          onChange={(e) => toggleOne(r.id, e.target.checked)}
                          aria-label={`Select ${r.name}`}
                        />
                      </label>
                      <div className="consumers-mobile-card__identity">
                        <strong>{r.name}</strong>
                        <span>Joined {r.joined}</span>
                      </div>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    </div>
                    <div className="consumers-mobile-card__grid">
                      <div>
                        <span className="consumers-mobile-card__label">Phone</span>
                        <span className="consumers-mobile-card__value mono">{r.phone}</span>
                      </div>
                      <div>
                        <span className="consumers-mobile-card__label">Email</span>
                        <span className="consumers-mobile-card__value">{r.email}</span>
                      </div>
                      <div>
                        <span className="consumers-mobile-card__label">Auths</span>
                        <span className="consumers-mobile-card__value">{r.authentications}</span>
                      </div>
                      <div>
                        <span className="consumers-mobile-card__label">Gifts</span>
                        <span className="consumers-mobile-card__value">
                          {r.giftsWon} won · {r.giftsRedeemed} redeemed
                        </span>
                      </div>
                      <div className="consumers-mobile-card__span2">
                        <span className="consumers-mobile-card__label">Points / next gift</span>
                        <PointsBar points={r.points} progress={r.progressToNextGift} />
                      </div>
                      {r.reports > 0 && (
                        <div>
                          <span className="consumers-mobile-card__label">Reports</span>
                          <Badge variant="br">{r.reports}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="consumers-mobile-card__actions">
                      <Button size="sm" variant="secondary" onClick={() => void viewConsumer(r.id)}>
                        View details
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        <div className="consumers-note">
          ℹ{' '}
          {note ||
            'Consumer personal data is masked by default. Revealing or exporting PII is recorded in the audit log. Handle in line with the Nigeria Data Protection Act (NDPA) 2023.'}
        </div>
      </Card>

      <Modal
        open={!!detail || detailLoading}
        onClose={() => setDetail(null)}
        title={detail?.name || (detailLoading ? 'Loading…' : 'Consumer')}
        subtitle={
          detail ? `${detail.phone} · ${detail.email} · Joined ${detail.joined}` : undefined
        }
        width={760}
        footer={
          <ModalFooter>
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Close
            </Button>
          </ModalFooter>
        }
      >
        {detailLoading && !detail ? (
          <div style={{ padding: '16px 20px', color: 'var(--text3)' }}>Loading consumer…</div>
        ) : detail ? (
          <div className="consumers-detail">
            <div className="consumers-detail__badges">
              <Badge variant={statusVariant(detail.status)}>{detail.status}</Badge>
              <Badge variant="bb">{detail.pointsToNextGift} pts to next gift</Badge>
            </div>

            <div className="consumers-detail__kpis">
              {[
                { label: 'Points', value: detail.points },
                { label: 'Authentications', value: detail.authentications },
                { label: 'Gifts Won', value: detail.giftsWon },
                { label: 'Redeemed', value: detail.giftsRedeemed },
              ].map((k) => (
                <div key={k.label} className="kcard" style={{ padding: 11 }}>
                  <div className="klbl">{k.label}</div>
                  <div className="kval" style={{ fontSize: 20 }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="consumers-detail__section-title">Recent authentications</div>
            <div className="consumers-detail__hint">
              Each successful PIN authentication awards <strong>10 points</strong>. Showing the most
              recent scans.
            </div>
            <TableWrap minWidth={480}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>PIN Used</th>
                    <th>Batch No.</th>
                    <th>Date & Time</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.auths.map((a, i) => (
                    <tr key={`${a.pin}-${i}`}>
                      <td>{a.product}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{a.pin}</td>
                      <td>{a.batch}</td>
                      <td>{a.date}</td>
                      <td>
                        <Badge variant={a.result === 'Genuine' ? 'bg' : 'ba'}>{a.result}</Badge>
                      </td>
                    </tr>
                  ))}
                  {detail.auths.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 12 }}>
                        No authentications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrap>

            <div className="consumers-detail__section-title">Gifts won & redeemed</div>
            <div className="consumers-detail__hint">
              Result and points come from the <strong>first</strong> successful authentication of
              that PIN (10 pts). Duplicate awards for the same PIN are merged into one row.
            </div>
            <TableWrap minWidth={720}>
              <table>
                <thead>
                  <tr>
                    <th>Gift</th>
                    <th>PIN Used</th>
                    <th>Result</th>
                    <th>Points</th>
                    <th>Pool</th>
                    <th>Won</th>
                    <th>Status</th>
                    <th>Redeemed At</th>
                    <th>Rep / Method</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.gifts.map((g, i) => (
                    <tr key={`${g.gift}-${g.pin}-${i}`}>
                      <td>{g.gift}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{g.pin || '—'}</td>
                      <td>
                        <Badge variant={g.result === 'Genuine' ? 'bg' : 'ba'}>{g.result || '—'}</Badge>
                      </td>
                      <td>{g.pointsEarned != null && g.pointsEarned > 0 ? `+${g.pointsEarned}` : '—'}</td>
                      <td>{g.pool}</td>
                      <td>{g.won}</td>
                      <td>
                        <Badge
                          variant={g.statusRaw === 'REDEEMED' || g.status === 'Redeemed' ? 'bg' : 'ba'}
                        >
                          {g.status}
                        </Badge>
                      </td>
                      <td>{g.redeemedAt}</td>
                      <td>
                        {g.rep}
                        {g.method !== '—' ? ` · ${g.method}` : ''}
                      </td>
                    </tr>
                  ))}
                  {detail.gifts.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text3)', padding: 12 }}>
                        No gifts won.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrap>

            <div className="consumers-detail__section-title">Counterfeit reports</div>
            <TableWrap minWidth={520}>
              <table>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>PIN</th>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Reported</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.reports.map((r, i) => (
                    <tr key={`${r.ref}-${r.pin}-${i}`}>
                      <td>{r.ref}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{r.pin || '—'}</td>
                      <td>{r.product}</td>
                      <td>{r.batch}</td>
                      <td>{r.reported}</td>
                      <td>
                        <Badge variant="br">{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {detail.reports.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 12 }}>
                        No counterfeit reports filed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrap>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
