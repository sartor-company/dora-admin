import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import type { InvestigationTelemetry, TelemetrySession } from '../../api/investigations';
import type { BadgeVariant } from '../../types';

const TRIGGER_LABEL: Record<string, { label: string; variant: BadgeVariant }> = {
  PIN_LOCKOUT: { label: '🔒 PIN lockout', variant: 'br' },
  MANUAL: { label: 'Staff escalation', variant: 'ba' },
  REPORT: { label: 'Consumer report', variant: 'bb' },
};

const VERDICT_VARIANT: Record<string, BadgeVariant> = { Consistent: 'bg', Uncertain: 'ba', Suspicious: 'br' };

const SLOT_LABEL: Record<string, string> = {
  front: 'Front',
  back: 'Back',
  side1: 'Side 1',
  side2: 'Side 2',
  top: 'Top',
  bottom: 'Bottom',
  scratch_panel: 'Scratch panel',
  batch_code: 'Batch code',
  receipt: 'Receipt',
  other: 'Other',
};

function formatDateTime(value?: string | number | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function pinVariant(result: string | null): BadgeVariant {
  if (!result) return 'bx';
  if (result.startsWith('AUTHENTICATED')) return 'bg';
  return 'br';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="info-grid__label">{label}</div>
      <div className="info-grid__value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

function SessionCard({ s, revealed }: { s: TelemetrySession; revealed: boolean }) {
  const { showToast } = useToast();
  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => showToast('Session ID copied', 'success'));
  };

  return (
    <Card style={{ marginBottom: 14 }}>
      {/* Header: session, case, how it got here */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div className="info-grid__label">{s.sessionId ? 'Session ID' : 'Report (no session)'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, wordBreak: 'break-all' }}>
              {s.sessionId || s.caseRef}
            </span>
            {s.sessionId && (
              <button
                type="button"
                onClick={() => copy(s.sessionId!)}
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Copy
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            Customer case <strong style={{ fontFamily: "'DM Mono', monospace" }}>#{s.caseRef}</strong> · {formatDateTime(s.createdAt)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[...new Set(s.triggers.map((t) => t.trigger))].map((t) => (
            <Badge key={t} variant={TRIGGER_LABEL[t]?.variant || 'bx'}>
              {TRIGGER_LABEL[t]?.label || t}
            </Badge>
          ))}
          {s.status === 'LOCKED' && <Badge variant="br">LOCKED</Badge>}
        </div>
      </div>

      <div className="info-grid info-grid--3" style={{ marginBottom: 14 }}>
        <Field label="DORA scan">
          {s.dorascan ? (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <strong>{s.dorascan.score}</strong>
              <Badge variant={VERDICT_VARIANT[s.dorascan.verdict] || 'bx'}>{s.dorascan.verdict}</Badge>
            </span>
          ) : (
            <span style={{ color: 'var(--text3)' }}>No scan score</span>
          )}
        </Field>

        <Field label="PIN result">
          {s.pin.result ? <Badge variant={pinVariant(s.pin.result)}>{s.pin.result}</Badge> : <span style={{ color: 'var(--text3)' }}>—</span>}
          {s.pin.verifiedPin && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Verified PIN: {s.pin.verifiedPin}</span>
          )}
          {s.pin.failedCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>
              {s.pin.failedCount} failed attempt{s.pin.failedCount === 1 ? '' : 's'}
            </span>
          )}
        </Field>

        <Field label="Location">
          {s.location.gps ? (
            <a
              href={`https://www.google.com/maps?q=${s.location.gps.lat},${s.location.gps.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}
            >
              📍 {s.location.gps.lat.toFixed(5)}, {s.location.gps.lng.toFixed(5)}
            </a>
          ) : (
            <span style={{ color: 'var(--text3)', fontSize: 12 }}>No GPS captured</span>
          )}
          {(s.location.storeName || s.location.storeAddress) && (
            <span style={{ fontSize: 12 }}>
              🏬 {[s.location.storeName, s.location.storeAddress].filter(Boolean).join(' — ')}
            </span>
          )}
        </Field>

        <Field label={`Customer${s.customer ? ` (${s.customer.source === 'report' ? 'from report' : 'verified account'})` : ''}`}>
          {s.customer ? (
            <>
              <span>{s.customer.name || '—'}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{s.customer.phone || '—'}</span>
              <span style={{ fontSize: 12 }}>{s.customer.email || '—'}</span>
              {!revealed && (s.customer.phone || s.customer.email) && (
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>Masked — use “Reveal customer details”</span>
              )}
            </>
          ) : (
            <span style={{ color: 'var(--text3)' }}>Anonymous</span>
          )}
        </Field>
      </div>

      {s.pin.attempts.length > 0 && (
        <div style={{ border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: 8, padding: 12, background: 'rgba(254, 242, 242, 0.6)', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
            🛡️ All PIN attempts ({s.pin.attempts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {s.pin.attempts.map((a, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fff',
                  padding: '6px 10px',
                  borderRadius: 4,
                  border: '1px solid rgba(220, 38, 38, 0.15)',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{a.pin}</span>
                <span style={{ color: 'var(--text3)' }}>{formatDateTime(a.at)}</span>
                <Badge variant="br">{a.resultCode}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.reports.map((r) => (
        <div key={r.ticketId} style={{ fontSize: 12, marginBottom: 10 }}>
          <strong>{r.ticketId}</strong> · {r.issueType} · <span style={{ color: 'var(--text3)' }}>{formatDateTime(r.at)}</span>
          {r.notes && <div style={{ color: 'var(--text2)', marginTop: 2 }}>“{r.notes}”</div>}
        </div>
      ))}

      {s.photos.length > 0 && (
        <div>
          <div className="info-grid__label" style={{ marginBottom: 6 }}>
            Pack photos ({s.photos.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {s.photos.map((p, i) => (
              <a
                key={`${p.url}-${i}`}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                title={`${SLOT_LABEL[p.slot] || p.slot} · ${p.ticketId}`}
                style={{ position: 'relative', display: 'block', aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}
              >
                <img src={p.url} alt={`${SLOT_LABEL[p.slot] || p.slot} photo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  style={{
                    position: 'absolute',
                    left: 4,
                    bottom: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'rgba(11, 22, 64, 0.75)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {SLOT_LABEL[p.slot] || p.slot}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function InvTelemetry({
  telemetry,
  loading,
  onReveal,
}: {
  telemetry: InvestigationTelemetry | null;
  loading: boolean;
  onReveal: () => void;
}) {
  const sessions = telemetry?.sessions || [];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '4px 0 10px' }}>
        <div className="ct">Session telemetry ({sessions.length})</div>
        {telemetry?.revealed ? (
          <Badge variant="ba">Customer details revealed · audit logged</Badge>
        ) : (
          sessions.some((s) => s.customer) && (
            <Button size="sm" variant="secondary" onClick={onReveal} disabled={loading}>
              Reveal customer details
            </Button>
          )
        )}
      </div>
      {loading && !telemetry ? (
        <Card style={{ marginBottom: 14 }}>Loading telemetry…</Card>
      ) : sessions.length === 0 ? (
        <Card style={{ marginBottom: 14, color: 'var(--text3)', fontSize: 13 }}>
          No scan sessions or consumer reports are linked to this investigation yet.
        </Card>
      ) : (
        sessions.map((s) => <SessionCard key={s.key} s={s} revealed={!!telemetry?.revealed} />)
      )}
    </>
  );
}
