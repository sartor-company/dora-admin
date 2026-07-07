import { useEffect, useState } from 'react';
import { investigationsApi } from '../api/investigations';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useModal, type InvestigationActionPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';

const CLEAR_REASONS = [
  'Device/location inconsistency explained',
  'Consumer verified identity — genuine purchase confirmed',
  'QR scan error (label damage / camera issue)',
  'Retailer internal testing scan',
  'Other (explain below)',
];

interface Props {
  onSuccess: (message: string) => void;
}

export function ClearFalsePositiveModal({ onSuccess }: Props) {
  const { isOpen, closeModal, getPayload } = useModal();
  const { refreshInvestigations } = useTenantData();
  const open = isOpen('clear-fp');
  const payload = getPayload<InvestigationActionPayload>('clear-fp');

  const [reason, setReason] = useState(CLEAR_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason(CLEAR_REASONS[0]);
    setNotes('');
    setError('');
  }, [open, payload?.investigationId]);

  const submit = async () => {
    if (!payload?.investigationId) return;
    setSaving(true);
    setError('');
    try {
      await investigationsApi.clearFalsePositive(payload.investigationId, { reason, notes: notes.trim() || undefined });
      await refreshInvestigations();
      closeModal('clear-fp');
      onSuccess(`${payload.displayId || payload.investigationId} cleared as false positive. Batch lock lifted.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not clear investigation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={() => closeModal('clear-fp')} title="Clear as False Positive" width={440}>
      <div style={{ padding: 12, background: 'var(--gb)', borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gt)', marginBottom: 4 }}>
          ✓ This will resolve {payload?.displayId || 'this case'} as a false positive
        </div>
        <div style={{ fontSize: 12, color: 'var(--gt)' }}>
          The investigation will be closed and marked CLEARED. Any batch lock will be lifted.
        </div>
      </div>
      <FormGroup label="Clearance Reason *">
        <select className="inp" value={reason} onChange={(e) => setReason(e.target.value)}>
          {CLEAR_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </FormGroup>
      <FormGroup label="Notes">
        <textarea
          className="inp"
          rows={2}
          placeholder="Optional additional notes..."
          style={{ resize: 'vertical' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormGroup>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('clear-fp')} disabled={saving}>
          Cancel
        </Button>
        <Button variant="success" onClick={submit} disabled={saving || !payload?.investigationId}>
          {saving ? 'Saving…' : 'Clear as False Positive'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

const RECIPIENTS = ['Internal record only', 'NAFDAC', 'Nigerian Police Force', 'Legal counsel', 'Other'];

export function EvidenceBundleModal({ onSuccess }: Props) {
  const { isOpen, closeModal, getPayload } = useModal();
  const open = isOpen('evidence-bundle');
  const payload = getPayload<InvestigationActionPayload>('evidence-bundle');

  const [recipient, setRecipient] = useState(RECIPIENTS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setRecipient(RECIPIENTS[0]);
    setError('');
  }, [open, payload?.investigationId]);

  const submit = async () => {
    if (!payload?.investigationId) return;
    setSaving(true);
    setError('');
    try {
      const result = await investigationsApi.generateEvidenceBundle(payload.investigationId, recipient);
      closeModal('evidence-bundle');
      onSuccess(
        `Evidence bundle ${result.bundleId} generated.${result.emailedTo ? ` Download link sent to ${result.emailedTo}.` : ''}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate bundle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={() => closeModal('evidence-bundle')} title="Generate Evidence Bundle" width={460}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
        Compiles all forensic data for {payload?.displayId || 'this case'} into a structured PDF/ZIP for regulatory or legal submission.
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
        DORA AI Features (F1–F9)
      </div>
      <div style={{ display: 'grid', gap: 6, marginBottom: 12, fontSize: 12 }}>
        {[
          'F1–F5: Label geometry, colour histogram, typography match',
          'F6–F9: Hologram region, scratch panel, batch-specific microprint',
          'Feature score breakdown with per-feature confidence',
        ].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'var(--gb)', borderRadius: 6 }}>
            <span style={{ color: 'var(--gt)' }}>✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <FormGroup label="Intended Recipient">
        <select className="inp" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
          {RECIPIENTS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </FormGroup>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('evidence-bundle')} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving || !payload?.investigationId}>
          {saving ? 'Generating…' : 'Generate Bundle'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
