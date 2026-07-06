import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { investigationsApi } from '../../api/investigations';
import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InfoCell, InfoGrid } from '../../components/ui/InfoGrid';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useToast } from '../../context/ToastContext';
import type { InvestigationRow } from '../../api/investigations';
import type { BadgeVariant } from '../../types';

export function InvDetailPage() {
  const { navigateLegacy } = useApp();
  const { refreshInvestigations } = useTenantData();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const id = params.get('id') || '';
  const [inv, setInv] = useState<InvestigationRow | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    investigationsApi
      .get(id)
      .then(setInv)
      .catch(() => setInv(null))
      .finally(() => setLoading(false));
  }, [id]);

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
          <Badge variant={inv.statusVariant as BadgeVariant}>{inv.status.toUpperCase()}</Badge>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{inv.description || inv.desc}</p>
        <div className="hero-stats">
          <div>
            <div className="stat-banner__label">DORA Score</div>
            <div className="stat-banner__value">{inv.dora}</div>
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
          <InfoCell label="Severity" value={inv.flag} />
          <InfoCell label="Assigned" value={inv.officer || 'Unassigned'} />
          <InfoCell label="Status" value={inv.status} />
        </InfoGrid>
      </Card>

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
          Status changes and batch flags are coordinated with Sartor platform ops. Contact{' '}
          <a href="mailto:support@sartor.ng">support@sartor.ng</a> for escalation.
        </p>
      </Card>
    </>
  );
}
