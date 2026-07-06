import { useEffect, useState } from 'react';
import { investigationsApi } from '../api/investigations';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useModal, type FlagBatchPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';

interface FlagBatchModalProps {
  onSuccess: () => void;
}

export function FlagBatchModal({ onSuccess }: FlagBatchModalProps) {
  const { isOpen, closeModal, getPayload } = useModal();
  const { refreshInvestigations } = useTenantData();
  const open = isOpen('flag-batch-inv');
  const payload = getPayload<FlagBatchPayload>('flag-batch-inv');

  const [severity, setSeverity] = useState<'P1' | 'P2' | 'P3'>('P2');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSeverity('P2');
    setDescription('');
    setError('');
  }, [open, payload?.batchId]);

  const submit = async () => {
    if (!payload?.batchId || !description.trim()) {
      setError('Description is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await investigationsApi.create({
        batchId: payload.batchId,
        batch: payload.batchNumber,
        product: payload.productName,
        severity,
        description: description.trim(),
        doraScore: payload.doraScore,
      });
      await refreshInvestigations();
      closeModal('flag-batch-inv');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open investigation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('flag-batch-inv')}
      title="Flag Batch"
      width={460}
    >
      <div style={{ padding: 12, background: 'var(--rb)', borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rt)', marginBottom: 4 }}>
          Open investigation for {payload?.batchNumber || 'this batch'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--rt)' }}>
          Creates a case for your investigation team and notifies Sartor platform ops.
        </div>
      </div>
      <FormGroup label="Flag Severity">
        <select
          className="inp"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as 'P1' | 'P2' | 'P3')}
        >
          <option value="P1">P1 — Critical (batch mismatch / confirmed fraud)</option>
          <option value="P2">P2 — High (cloned PIN suspicion)</option>
          <option value="P3">P3 — Medium (pattern anomaly)</option>
        </select>
      </FormGroup>
      <FormGroup label="Flag Reason *">
        <textarea
          className="inp"
          rows={3}
          placeholder="Describe the reason for flagging this batch..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </FormGroup>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('flag-batch-inv')} disabled={saving}>
          Cancel
        </Button>
        <Button variant="danger" onClick={submit} disabled={saving}>
          {saving ? 'Submitting…' : 'Open Investigation'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
