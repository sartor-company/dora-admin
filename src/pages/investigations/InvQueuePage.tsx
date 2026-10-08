import { useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useTableFilter } from '../../hooks/useTableFilter';
import type { InvestigationRow } from '../../api/investigations';
import type { BadgeVariant } from '../../types';

type QueueState = 'active' | 'open' | 'progress' | 'resolved' | 'confirmed';

const QUEUE_STATES: { id: QueueState; label: string }[] = [
  { id: 'active', label: 'Active queue' },
  { id: 'open', label: 'Open' },
  { id: 'progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'confirmed', label: 'Confirmed counterfeit' },
];

function isConfirmed(inv: InvestigationRow) {
  return /confirmed/i.test(String(inv.outcome || ''));
}

function queueState(inv: InvestigationRow): Exclude<QueueState, 'active'> {
  const life = String(inv.lifecycle || '');
  if (life === 'Counterfeit Confirmed' || isConfirmed(inv)) return 'confirmed';
  if (life === 'False Positive' || life === 'Closed' || inv.status === 'Closed') return 'resolved';
  if (inv.status === 'In Progress') return 'progress';
  return 'open';
}

const PRIORITY_RANK: Record<string, number> = { P1: 0, P2: 1, P3: 2 };

function matchesQueueState(inv: InvestigationRow, state: QueueState) {
  if (state === 'active') return inv.status !== 'Closed';
  return queueState(inv) === state;
}

const priorityLegend = [
  { label: 'P1', desc: 'Critical — immediate action' },
  { label: 'P2', desc: 'High — review within 24h' },
  { label: 'P3', desc: 'Standard — queue order' },
];

function PriorityBadge({ priority, color, size = 22 }: { priority: string; color: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: size === 22 ? 10 : 9,
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

export function InvQueuePage() {
  const { companyName, navigateWithQuery } = useApp();
  const { investigations, investigationStats, loading } = useTenantData();
  const [queueStateFilter, setQueueStateFilter] = useState<QueueState>('active');
  const stateRows = useMemo(
    () =>
      investigations
        .filter((inv) => matchesQueueState(inv, queueStateFilter))
        .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9)),
    [investigations, queueStateFilter],
  );
  const { query, setQuery, filtered } = useTableFilter(stateRows, [
    'id',
    'flag',
    'product',
    'location',
    'batch',
    'sessionId',
    'pin',
    'outcome',
  ]);
  const counts = useMemo(
    () => ({
      active: investigations.filter((inv) => matchesQueueState(inv, 'active')).length,
      open: investigations.filter((inv) => matchesQueueState(inv, 'open')).length,
      progress: investigations.filter((inv) => matchesQueueState(inv, 'progress')).length,
      resolved: investigations.filter((inv) => matchesQueueState(inv, 'resolved')).length,
      confirmed: investigations.filter((inv) => matchesQueueState(inv, 'confirmed')).length,
    }),
    [investigations],
  );
  const showOutcome = queueStateFilter === 'resolved' || queueStateFilter === 'confirmed';

  return (
    <>
      <PageHeader
        title="Investigation Queue"
        subtitle={companyName}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Badge variant="br" style={{ fontSize: 12, padding: '5px 9px' }}>
              {investigationStats?.queue ?? counts.active} Open
            </Badge>
            <Badge variant="bg" style={{ fontSize: 12, padding: '5px 9px' }}>
              {counts.resolved} Resolved
            </Badge>
            <Badge variant="br" style={{ fontSize: 12, padding: '5px 9px' }}>
              {counts.confirmed} Confirmed
            </Badge>
          </div>
        }
      />

      <div className="invleg">
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Priority Order — DORA AI scoring</div>
        <div className="invgrid">
          {priorityLegend.map((item) => (
            <div key={item.label} className="invitem">
              <strong>{item.label}</strong> {item.desc}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <FilterBar>
          <input
            className="inp"
            placeholder="Search investigations, session, or PIN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="inp"
            value={queueStateFilter}
            onChange={(e) => setQueueStateFilter(e.target.value as QueueState)}
            style={{ width: 220 }}
            aria-label="Queue state"
          >
            {QUEUE_STATES.map((state) => (
              <option key={state.id} value={state.id}>
                {state.label} ({counts[state.id]})
              </option>
            ))}
          </select>
        </FilterBar>
        {loading && !investigations.length ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>Loading…</div>
        ) : (
          <TableWrap minWidth={800}>
            <table>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>ID</th>
                  <th>Flag</th>
                  <th>Batch</th>
                  <th>Product</th>
                  <th>DORA</th>
                  <th>Status</th>
                  {showOutcome && <th>Outcome</th>}
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="cl"
                    onClick={() => navigateWithQuery('/investigations/detail', { id: inv.id })}
                  >
                    <td>
                      <PriorityBadge priority={inv.priority} color={inv.priorityColor} />
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.id}</td>
                    <td>
                      <Badge variant={inv.flagVariant as BadgeVariant}>{inv.flag}</Badge>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.batch}</td>
                    <td>{inv.product}</td>
                    <td
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 700,
                        color: inv.dora == null ? 'var(--text3)' : 'var(--rt)',
                      }}
                    >
                      {inv.dora == null ? '—' : inv.dora}
                    </td>
                    <td>
                      <Badge variant={(inv.lifecycleVariant || inv.statusVariant) as BadgeVariant}>{inv.lifecycle || inv.status}</Badge>
                    </td>
                    {showOutcome && (
                      <td>
                        <Badge variant={(inv.outcomeVariant as BadgeVariant) || 'bg'}>{inv.outcome || '—'}</Badge>
                      </td>
                    )}
                    <td>{inv.location}</td>
                    <td>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateWithQuery('/investigations/detail', { id: inv.id });
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={showOutcome ? 10 : 9} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>
                      {queueStateFilter === 'resolved'
                        ? 'No resolved cases yet.'
                        : queueStateFilter === 'confirmed'
                          ? 'No confirmed counterfeit cases yet.'
                          : 'No investigations in this queue state.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
