import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useToast } from '../../context/ToastContext';
import type { BadgeVariant } from '../../types';
import type { ScanSession, ScanSessionsResponse } from '../../types/analytics';
import { downloadCsv } from '../../utils/export';

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeOnly(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const geocodeCache = new Map<string, string>();

function GeoName({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (geocodeCache.has(key)) {
      setName(geocodeCache.get(key)!);
      return;
    }

    const fetchName = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const address = data.address;
        if (address) {
          const city =
            address.suburb ||
            address.village ||
            address.town ||
            address.city ||
            address.county;
          const state = address.state || address.country;
          const resolved = [city, state].filter(Boolean).join(', ');
          if (resolved) {
            geocodeCache.set(key, resolved);
            setName(resolved);
          }
        }
      } catch (err) {
        console.error('Failed to reverse geocode', err);
      }
    };

    fetchName();
  }, [lat, lng]);

  if (lat == null || lng == null) return <span>—</span>;
  return name ? <span>{name}</span> : <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>;
}

function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'COMPLETED':
      return 'bg';
    case 'PENDING':
      return 'ba';
    case 'TIMEOUT':
      return 'bx';
    default:
      return 'bb';
  }
}

function doraScoreVariant(score?: number): BadgeVariant {
  if (score == null) return 'bx';
  if (score >= 80) return 'bg';
  if (score >= 60) return 'ba';
  return 'br';
}

function verdictVariant(verdict?: string): BadgeVariant {
  if (!verdict) return 'bx';
  if (verdict.startsWith('AUTH')) return 'bg';
  if (verdict.includes('MISMATCH') || verdict.includes('SUSPICIOUS') || verdict.includes('FAIL')) return 'br';
  return 'ba';
}

export function BrandScansPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ScanSessionsResponse | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [stage, setStage] = useState('All Stages');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Modal inspection
  const [inspectingSession, setInspectingSession] = useState<ScanSession | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchScans = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const res = await analyticsApi.scanSessions({
          page,
          limit,
          status: status !== 'All Statuses' ? status : undefined,
          stage: stage === 'Stage 1' ? 1 : stage === 'Stage 2' ? 2 : undefined,
          search: search.trim() || undefined,
        });
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scan sessions');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, status, stage, search],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchScans();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchScans]);

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(id).then(
      () => {
        setCopiedId(id);
        showToast('Session ID copied to clipboard', 'success');
        setTimeout(() => setCopiedId(null), 2000);
      },
      () => {
        showToast('Failed to copy ID', 'error');
      },
    );
  };

  const handleExportCsv = () => {
    if (!data?.sessions.length) {
      showToast('No sessions to export');
      return;
    }
    const headers = [
      'Date & Time',
      'Session ID',
      'Stage',
      'Status',
      'Product Name',
      'Batch Number',
      'PIN',
      'DORA Score',
      'Authentic',
      'Result Code',
      'Latitude',
      'Longitude',
      'Consumer',
    ];
    const rows = data.sessions.map((s) => [
      s.createdAt ? new Date(s.createdAt).toISOString() : '',
      s.sessionId,
      s.stage === 2 ? 'Stage 2 (Auth)' : 'Stage 1 (Scan)',
      s.status,
      s.productName || '—',
      s.batchNumber || '—',
      s.pin || '—',
      s.scanDoraScore != null ? `${s.scanDoraScore}%` : '—',
      s.isAuthentic != null ? (s.isAuthentic ? 'Yes' : 'No') : '—',
      s.authResult || '—',
      s.latitude != null ? String(s.latitude) : '—',
      s.longitude != null ? String(s.longitude) : '—',
      typeof s.consumerId === 'object' && s.consumerId !== null
        ? s.consumerId.phone_masked || s.consumerId.email || 'Registered'
        : 'Guest',
    ]);
    downloadCsv(`dora-scan-sessions-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Scan sessions exported to CSV', 'success');
  };

  const completionRate = useMemo(() => {
    if (!data?.kpis?.total) return 0;
    return Math.round(((data.kpis.completedCount || 0) / data.kpis.total) * 100);
  }, [data]);

  const stage1DropRate = useMemo(() => {
    if (!data?.kpis?.total) return 0;
    return Math.round(((data.kpis.stage1Count || 0) / data.kpis.total) * 100);
  }, [data]);

  const hasFilters = search || status !== 'All Statuses' || stage !== 'All Stages';

  const resetFilters = () => {
    setSearch('');
    setStatus('All Statuses');
    setStage('All Stages');
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Scans"
        subtitle="End-to-end trace of physical-to-digital scan sessions, DORA AI computer vision verification, and consumer authentication."
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void fetchScans(true)}
              disabled={refreshing || loading}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: refreshing ? 'rotate(360deg)' : 'none',
                  transition: 'transform 0.6s ease',
                  marginRight: 4,
                }}
              >
                ↻
              </span>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={!data?.sessions.length}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <KCardGrid columns={4}>
        <KCard
          label="Total Scan Sessions"
          value={String(data?.kpis?.total ?? 0)}
          trend="Recorded across all batches"
          style={{ borderLeft: '3px solid var(--navy)' }}
        />
        <KCard
          label="Stage 2 Completed"
          value={String(data?.kpis?.completedCount ?? 0)}
          trend={`${completionRate}% consumer conversion rate`}
          trendType="up"
          style={{ borderLeft: '3px solid var(--green)' }}
        />
        <KCard
          label="Stage 1 Drop-offs"
          value={String(data?.kpis?.stage1Count ?? 0)}
          trend={`${stage1DropRate}% scanned packaging only`}
          trendType="neu"
          style={{ borderLeft: '3px solid var(--amber)' }}
        />
        <KCard
          label="Timed Out / Abandoned"
          value={String(data?.kpis?.timeoutCount ?? 0)}
          trend="Expired before completion"
          trendType="dn"
          style={{ borderLeft: '3px solid var(--red)' }}
        />
      </KCardGrid>

      {/* Filter Toolbar */}
      <Card style={{ marginBottom: 16 }}>
        <FilterBar>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="inp"
              placeholder="Search session ID, batch, product, PIN, or verdict…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="inp"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: 140 }}
            >
              <option>All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="TIMEOUT">Timed Out</option>
            </select>

            <select
              className="inp"
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setPage(1);
              }}
              style={{ width: 150 }}
            >
              <option>All Stages</option>
              <option value="Stage 1">Stage 1 (Scan Only)</option>
              <option value="Stage 2">Stage 2 (Authenticated)</option>
            </select>

            {hasFilters && (
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </div>
        </FilterBar>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--red)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </Card>

      {/* Main Scans Table */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            padding: '4px 4px 0 4px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>
            Live Sessions {data?.pagination ? `(${data.pagination.total})` : ''}
          </div>
          {data?.pagination && data.pagination.pages > 1 && (
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Page {data.pagination.page} of {data.pagination.pages}
            </div>
          )}
        </div>

        <TableWrap minWidth={950}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 150 }}>Timestamp</th>
                <th style={{ width: 140 }}>Session ID</th>
                <th>Product & Batch</th>
                <th style={{ width: 90, textAlign: 'center' }}>Stage</th>
                <th style={{ width: 90, textAlign: 'center' }}>DORA Score</th>
                <th>Verdict / PIN</th>
                <th style={{ width: 110, textAlign: 'center' }}>Status</th>
                <th>Location</th>
                <th>Consumer</th>
                <th style={{ width: 70, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                    Loading scan sessions…
                  </td>
                </tr>
              )}

              {!loading && (!data?.sessions || data.sessions.length === 0) && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontWeight: 600, color: 'var(--text1)', marginBottom: 4 }}>
                      No scan sessions found
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 360, margin: '0 auto' }}>
                      {hasFilters
                        ? 'No sessions match your active filter criteria. Try resetting the filters.'
                        : 'Consumer scans will appear here in real time as soon as products are verified.'}
                    </div>
                  </td>
                </tr>
              )}

              {(data?.sessions || []).map((s) => {
                const consumerObj =
                  typeof s.consumerId === 'object' && s.consumerId !== null ? s.consumerId : null;
                const hasGeo = s.latitude != null && s.longitude != null;

                return (
                  <tr
                    key={s._id || s.sessionId}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setInspectingSession(s)}
                  >
                    {/* Timestamp */}
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--text1)' }}>
                        {formatDateTime(s.createdAt)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "'DM Mono', monospace" }}>
                        {formatTimeOnly(s.createdAt)}
                      </div>
                    </td>

                    {/* Session ID */}
                    <td>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                          background: 'var(--card-subtle, rgba(0,0,0,0.03))',
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                        }}
                        title={s.sessionId}
                      >
                        <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.sessionId.slice(0, 8)}…{s.sessionId.slice(-4)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(s.sessionId, e)}
                          title="Copy full Session ID"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            color: copiedId === s.sessionId ? 'var(--green)' : 'var(--text3)',
                            fontSize: 11,
                            lineHeight: 1,
                          }}
                        >
                          {copiedId === s.sessionId ? '✓' : '⧉'}
                        </button>
                      </div>
                    </td>

                    {/* Product & Batch */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text1)' }}>
                        {s.productName || 'Unassigned Product'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 11,
                            color: 'var(--text2)',
                            background: 'rgba(0,0,0,0.04)',
                            padding: '1px 5px',
                            borderRadius: 3,
                          }}
                        >
                          {s.batchNumber || 'No Batch'}
                        </span>
                      </div>
                    </td>

                    {/* Stage */}
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={s.stage === 2 ? 'bg' : 'bb'}>
                        {s.stage === 2 ? 'Stage 2' : 'Stage 1'}
                      </Badge>
                    </td>

                    {/* DORA Score */}
                    <td style={{ textAlign: 'center' }}>
                      {s.scanDoraScore != null ? (
                        <Badge variant={doraScoreVariant(s.scanDoraScore)}>
                          {s.scanDoraScore}%
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--text3)' }}>—</span>
                      )}
                    </td>

                    {/* Verdict / PIN */}
                    <td>
                      {s.authResult ? (
                        <div>
                          <Badge variant={verdictVariant(s.authResult)}>
                            {s.authResult}
                          </Badge>
                          {s.pin && (
                            <div
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 10,
                                color: 'var(--text3)',
                                marginTop: 3,
                                letterSpacing: '0.05em',
                              }}
                            >
                              PIN: {s.pin}
                            </div>
                          )}
                          {(s.failedPinCount || 0) > 0 && (
                            <div
                              style={{
                                fontSize: 10,
                                color: 'var(--red)',
                                marginTop: 2,
                                fontWeight: 600,
                              }}
                              title={`${s.failedPinCount} failed PIN attempt(s) recorded for brute-force auditing`}
                            >
                              ⚠️ {s.failedPinCount} failed attempt{(s.failedPinCount || 0) > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ) : s.isAuthentic != null ? (
                        <Badge variant={s.isAuthentic ? 'bg' : 'br'}>
                          {s.isAuthentic ? 'Authentic' : 'Suspicious'}
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={statusBadgeVariant(s.status)}>
                        {s.status}
                      </Badge>
                    </td>

                    {/* Geolocation */}
                    <td>
                      {hasGeo ? (
                        <a
                          href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 11,
                            color: 'var(--navy)',
                            textDecoration: 'none',
                            background: 'rgba(11, 22, 64, 0.05)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                          title="Open coordinates in Google Maps"
                        >
                          <span>📍</span>
                          <GeoName lat={s.latitude} lng={s.longitude} />
                          <span style={{ fontSize: 9 }}>↗</span>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Consumer */}
                    <td>
                      {consumerObj ? (
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 12 }}>
                            {consumerObj.phone_masked ||
                              (consumerObj.firstName
                                ? `${consumerObj.firstName} ${consumerObj.lastName || ''}`.trim()
                                : 'Registered')}
                          </div>
                          {consumerObj.email && (
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                              {consumerObj.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>Guest</span>
                      )}
                    </td>

                    {/* Details Action */}
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingSession(s);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>

        {/* Pagination Footer */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Showing {data.sessions.length} of {data.pagination.total} sessions
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '0 8px',
                  color: 'var(--text2)',
                }}
              >
                {page} / {data.pagination.pages}
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= data.pagination.pages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Session Details Inspector Modal */}
      <Modal
        open={Boolean(inspectingSession)}
        onClose={() => setInspectingSession(null)}
        title="Scan Session Inspector"
        subtitle={`Session ID: ${inspectingSession?.sessionId || ''}`}
        width={620}
        footer={
          <ModalFooter>
            <Button variant="secondary" onClick={() => setInspectingSession(null)}>
              Close
            </Button>
          </ModalFooter>
        }
      >
        {inspectingSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
            {/* Header / Badges Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--card-subtle, rgba(0,0,0,0.02))',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lifecycle Status
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <Badge variant={statusBadgeVariant(inspectingSession.status)}>
                    {inspectingSession.status}
                  </Badge>
                  <Badge variant={inspectingSession.stage === 2 ? 'bg' : 'bb'}>
                    {inspectingSession.stage === 2 ? 'Stage 2 (Authenticated)' : 'Stage 1 (Scan Only)'}
                  </Badge>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Created</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text1)', marginTop: 2 }}>
                  {formatDateTime(inspectingSession.createdAt)}
                </div>
              </div>
            </div>

            {/* Stage 1 Inspection Card */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 14,
                background: 'var(--card-bg, #fff)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text1)',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>📷</span> Stage 1: Computer Vision & Packaging Scan
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Product Name</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', marginTop: 2 }}>
                    {inspectingSession.productName || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Batch Number</div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text1)',
                      marginTop: 2,
                    }}
                  >
                    {inspectingSession.batchNumber || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>DORA Confidence Score</div>
                  <div style={{ marginTop: 2 }}>
                    {inspectingSession.scanDoraScore != null ? (
                      <Badge variant={doraScoreVariant(inspectingSession.scanDoraScore)}>
                        {inspectingSession.scanDoraScore}% Confidence
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Physical Integrity</div>
                  <div style={{ marginTop: 2 }}>
                    {inspectingSession.isAuthentic != null ? (
                      <Badge variant={inspectingSession.isAuthentic ? 'bg' : 'br'}>
                        {inspectingSession.isAuthentic ? 'Authentic Packaging' : 'Tampered / Suspicious'}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 2 Inspection Card */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 14,
                background: 'var(--card-bg, #fff)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text1)',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>🔐</span> Stage 2: Scratch-off PIN Verification
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Scratch PIN Entered</div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text1)',
                      marginTop: 2,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {inspectingSession.pin || 'None (Stage 1 drop-off)'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Verification Result</div>
                  <div style={{ marginTop: 2 }}>
                    {inspectingSession.authResult ? (
                      <Badge variant={verdictVariant(inspectingSession.authResult)}>
                        {inspectingSession.authResult}
                      </Badge>
                    ) : (
                      <span style={{ color: 'var(--text3)', fontSize: 12 }}>Not verified yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Consumer</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text1)', marginTop: 2 }}>
                    {typeof inspectingSession.consumerId === 'object' && inspectingSession.consumerId !== null
                      ? inspectingSession.consumerId.phone_masked ||
                        inspectingSession.consumerId.email ||
                        'Registered Consumer'
                      : 'Anonymous / Guest'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Last Updated</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    {formatDateTime(inspectingSession.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Geolocation Section */}
            {inspectingSession.latitude != null && inspectingSession.longitude != null && (
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 14,
                  background: 'var(--card-bg, #fff)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text1)',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>📍</span> Geolocation
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--text1)', display: 'flex', gap: 6 }}>
                    <GeoName lat={inspectingSession.latitude} lng={inspectingSession.longitude} />
                    <span style={{ color: 'var(--text3)' }}>
                      ({inspectingSession.latitude}, {inspectingSession.longitude})
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${inspectingSession.latitude},${inspectingSession.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--navy)',
                    }}
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>
            )}

            {/* Brute-Force & PIN Attempt Audit Section */}
            {((inspectingSession.invalidPinAttempts && inspectingSession.invalidPinAttempts.length > 0) || (inspectingSession.failedPinCount || 0) > 0) && (
              <div
                style={{
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: 8,
                  padding: 14,
                  background: 'rgba(254, 242, 242, 0.6)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--red)',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🛡️</span> PIN Audit Trail ({inspectingSession.failedPinCount || inspectingSession.invalidPinAttempts?.length} Failed Attempt{(inspectingSession.failedPinCount || 1) > 1 ? 's' : ''})
                  </span>
                  <Badge variant="br">Security Flagged</Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                  {(inspectingSession.invalidPinAttempts || []).map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 11,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#fff',
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: '1px solid rgba(220, 38, 38, 0.15)',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      <span style={{ color: 'var(--red)', fontWeight: 600 }}>Attempt: {att.pin}</span>
                      <span style={{ color: 'var(--text3)' }}>{formatDateTime(att.attemptedAt)}</span>
                      <Badge variant="br">{att.resultCode}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON Debug Expander */}
            <details style={{ fontSize: 11, color: 'var(--text3)', cursor: 'pointer' }}>
              <summary style={{ userSelect: 'none', marginBottom: 6 }}>View Raw Session Payload</summary>
              <pre
                style={{
                  background: '#0B1640',
                  color: '#94A3B8',
                  padding: 12,
                  borderRadius: 6,
                  overflowX: 'auto',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  lineHeight: 1.4,
                }}
              >
                {JSON.stringify(inspectingSession, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </Modal>
    </>
  );
}
