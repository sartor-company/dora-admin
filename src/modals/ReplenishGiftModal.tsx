import { useEffect, useState } from 'react';
import { giftsApi } from '../api/gifts';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useModal, type ReplenishGiftPayload } from '../context/ModalContext';

interface ReplenishGiftModalProps {
  onSuccess: () => void;
}

export function ReplenishGiftModal({ onSuccess }: ReplenishGiftModalProps) {
  const { isOpen, closeModal, getPayload } = useModal();
  const open = isOpen('replenish');
  const payload = getPayload<ReplenishGiftPayload>('replenish');

  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [releaseWaitlist, setReleaseWaitlist] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuantity(10);
    setNotes('');
    setReleaseWaitlist(true);
    setError('');
  }, [open, payload?.giftId]);

  const submit = async () => {
    if (!payload || quantity < 1) {
      setError('Enter a valid quantity.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await giftsApi.replenishGift(payload.campaignId, payload.poolId, payload.giftId, {
        quantity,
        notes: notes.trim() || undefined,
        releaseToWaitlist: releaseWaitlist,
      });
      closeModal('replenish');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Replenish failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('replenish')}
      title="Replenish Gift Stock"
      width={420}
      subtitle={payload ? `${payload.poolName} — ${payload.giftName}` : undefined}
    >
      {payload && (
        <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
          <div>
            <div style={{ color: 'var(--text3)' }}>Current stock</div>
            <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{payload.remaining}</div>
          </div>
        </div>
      )}
      <FormGroup label="Add Quantity *">
        <input
          type="number"
          className="inp"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
        />
      </FormGroup>
      <FormGroup label="Replenishment Notes (optional)">
        <input
          className="inp"
          placeholder="e.g. Batch 3 stock received from supplier"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormGroup>
      <div className="twrap" style={{ padding: '10px 0', borderTop: '1px solid var(--bg2)', marginTop: 4 }}>
        <div>
          <div className="tlbl">Release to PENDING_STOCK waitlist</div>
          <div className="tdesc">Assign gifts to waiting consumers in chronological order</div>
        </div>
        <input
          type="checkbox"
          checked={releaseWaitlist}
          onChange={(e) => setReleaseWaitlist(e.target.checked)}
          aria-label="Release to waitlist"
        />
      </div>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginTop: 10 }}>
          {error}
        </div>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('replenish')} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving || !payload}>
          {saving ? 'Saving…' : 'Replenish Stock'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
