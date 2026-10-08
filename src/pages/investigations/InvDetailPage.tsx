import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INVESTIGATION_LIFECYCLES, investigationsApi } from '../../api/investigations';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InfoCell, InfoGrid } from '../../components/ui/InfoGrid';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useToast } from '../../context/ToastContext';
import type { InvestigationLifecycle, InvestigationRow, InvestigationTelemetry } from '../../api/investigations';
import type { BadgeVariant } from '../../types';
import { InvTelemetry } from './InvTelemetry';

const LIFECYCLE_HINT: Record<InvestigationLifecycle, string> = {
  Open: 'Reopen the case for active review.',
  'False Positive': 'No counterfeit found — the batch is released if it was paused.',
  Closed: 'Reviewed and closed without a counterfeit determination.',
  'Counterfeit Confirmed': 'The product is confirmed counterfeit.',
};

export function InvDetailPage() {
  const { navigateLegacy, role } = useApp();
  // Server enforces the same rule (owner / Investigation Officer)
  const canManage = role === 'owner' || role === 'inv';
  const { openModal } = useModal();
  const { refreshInvestigations } = useTenantData();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const id = params.get('id') || '';
  const [inv, setInv] = useState<InvestigationRow | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<InvestigationTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [pendingLifecycle, setPendingLifecycle] = useState<{ target: InvestigationLifecycle; reason: string } | null>(null);
  const [savingLifecycle, setSavingLifecycle] = useState(false);

  const loadTelemetry = useCallback(
    async (reveal = false) => {
      if (!id) return;
      setTelemetryLoading(true);
      try {
        setTelemetry(await investigationsApi.telemetry(id, reveal));
        if (reveal) showToast('Customer details revealed — this access was recorded in the audit log.', 'success');
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not load session telemetry');
      } finally {
        setTelemetryLoading(false);
      }
    },
    [id, showToast],
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    investigationsApi
      .get(id)
      .then(setInv)
      .catch(() => setInv(null))
      .finally(() => setLoading(false));
    void loadTelemetry(false);
  }, [id, loadTelemetry]);

  const confirmLifecycle = async () => {
    if (!id || !pendingLifecycle) return;
    setSavingLifecycle(true);
    try {
      const updated = await investigationsApi.setLifecycle(id, pendingLifecycle.target, pendingLifecycle.reason.trim() || undefined);
      setInv(updated);
      setPendingLifecycle(null);
      showToast(
        updated.customersNotified
          ? `Status set to ${pendingLifecycle.target} — customers on this case have been emailed.`
          : `Status is already ${pendingLifecycle.target}.`,
        'success',
      );
      await refreshInvestigations();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not change status');
    } finally {
      setSavingLifecycle(false);
    }
  };

  const addNote = async () => {
    if (!id || !note.trim()) return;
    try {
      const updated = await investigationsApi.addNote(id, note.trim());
      setInv(updated);
      setNote('');
      showToast('Note added to investigation', 'success');
      await refreshInvestigations();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save note');
    }
  };

  if (!id) {
    return (
      <div style={{ padding: 24, color: 'var(--text3)' }}>
        No investigation selected.{' '}
        <button type="button" className="linkish" onClick={() => navigateLegacy('pg-inv-queue')}>
          Back to queue
        </button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 24 }}>Loading investigation…</div>;
  if (!inv) return <div style={{ padding: 24, color: 'var(--rt)' }}>Investigation not found.</div>;

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-inv-queue')}>← Back to Investigation Queue</BackLink>

      <div className="hero">
        <div className="title-row" style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{inv.id}</div>
          <Badge variant="br">{inv.priority} PRIORITY</Badge>
          <Badge variant={(inv.lifecycleVariant || inv.statusVariant) as BadgeVariant}>
            {String(inv.lifecycle || inv.status).toUpperCase()}
          </Badge>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{inv.description || inv.desc}</p>
        <div className="hero-stats">
          <div>
            <div className="stat-banner__label">DORA Score</div>
            <div className="stat-banner__value">{inv.dora == null ? '—' : inv.dora}</div>
          </div>
          <div>
            <div className="stat-banner__label">Opened</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4 }}>{inv.opened}</div>
          </div>
          <div>
            <div className="stat-banner__label">Product</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4 }}>{inv.product}</div>
          </div>
          <div>
            <div className="stat-banner__label">Location</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4 }}>{inv.location}</div>
          </div>
        </div>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <InfoGrid>
          <InfoCell label="Batch" value={inv.batch} />
          <InfoCell label="Severity" value={inv.priority} />
          <InfoCell label="Flag" value={inv.flag} />
          <InfoCell label="Assigned" value={inv.officer || 'Unassigned'} />
          <InfoCell label="Status" value={String(inv.lifecycle || inv.status)} />
          <InfoCell label="Session" value={inv.sessionId || '—'} />
          <InfoCell label="PIN" value={inv.pin || '—'} />
          <InfoCell
            label="GPS"
            value={
              inv.latitude != null && inv.longitude != null
                ? `${inv.latitude}, ${inv.longitude}`
                : inv.location || '—'
            }
          />
        </InfoGrid>
      </Card>


      {canManage && (
        <Card style={{ marginBottom: 14 }}>
          <div className="ct" style={{ marginBottom: 10 }}>
            Case status
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {INVESTIGATION_LIFECYCLES.map((state) => {
              const current = (inv.lifecycle || (inv.status === 'Closed' ? 'Closed' : 'Open')) === state;
              return (
                <Button
                  key={state}
                  size="sm"
                  variant={current ? (state === 'False Positive' ? 'success' : state === 'Closed' ? 'secondary' : 'danger') : 'secondary'}
                  disabled={current}
                  onClick={() => setPendingLifecycle({ target: state, reason: '' })}
                  title={LIFECYCLE_HINT[state]}
                >
                  {current ? `● ${state}` : state}
                </Button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, marginBottom: 0 }}>
            Changing the status emails every customer linked to this case with an update for their own Case #.
          </p>
        </Card>
      )}

      {inv.status !== 'Closed' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            onClick={() =>
              openModal('evidence-bundle', { investigationId: inv._id || inv.id, displayId: inv.id })
            }
          >
            ↗ Generate Evidence Bundle
          </Button>
        </div>
      )}

      <InvTelemetry telemetry={telemetry} loading={telemetryLoading} onReveal={() => void loadTelemetry(true)} />

      <Card>
        <div className="ct" style={{ marginBottom: 12 }}>
          Add note
        </div>
        <textarea
          className="inp"
          rows={3}
          placeholder="Document findings, site visit notes, or consumer contact…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <Button onClick={addNote}>Save Note</Button>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
          Batch flags are coordinated with Sartor platform ops. Contact{' '}
          <a href="mailto:support@sartor.ng">support@sartor.ng</a> for escalation.
        </p>
      </Card>

      <Modal
        open={Boolean(pendingLifecycle)}
        onClose={() => setPendingLifecycle(null)}
        title={`Set status: ${pendingLifecycle?.target || ''}`}
        subtitle={pendingLifecycle ? LIFECYCLE_HINT[pendingLifecycle.target] : ''}
        width={460}
        footer={
          <ModalFooter>
            <Button variant="secondary" onClick={() => setPendingLifecycle(null)} disabled={savingLifecycle}>
              Cancel
            </Button>
            <Button onClick={() => void confirmLifecycle()} disabled={savingLifecycle}>
              {savingLifecycle ? 'Saving…' : 'Confirm & notify customers'}
            </Button>
          </ModalFooter>
        }
      >
        <textarea
          className="inp"
          rows={3}
          placeholder="Reason (optional, kept in the case notes)…"
          value={pendingLifecycle?.reason || ''}
          onChange={(e) => pendingLifecycle && setPendingLifecycle({ ...pendingLifecycle, reason: e.target.value })}
          style={{ width: '100%', marginTop: 12 }}
        />
      </Modal>
    </>
  );
}
