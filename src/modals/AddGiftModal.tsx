import { useEffect, useState } from 'react';
import { giftsApi } from '../api/gifts';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useModal, type AddGiftPayload } from '../context/ModalContext';

interface AddGiftModalProps {
  onSuccess: () => void;
}

export function AddGiftModal({ onSuccess }: AddGiftModalProps) {
  const { isOpen, closeModal, getPayload } = useModal();
  const open = isOpen('add-gift');
  const payload = getPayload<AddGiftPayload>('add-gift');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalQty, setTotalQty] = useState(100);
  const [weight, setWeight] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setDescription('');
    setTotalQty(100);
    setWeight(1);
    setError('');
  }, [open, payload?.poolId]);

  const submit = async () => {
    if (!payload || !name.trim() || totalQty < 1) {
      setError('Gift name and quantity are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await giftsApi.addGiftToPool(payload.campaignId, payload.poolId, {
        name: name.trim(),
        description: description.trim() || undefined,
        totalQty,
        weight,
      });
      closeModal('add-gift');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add gift.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('add-gift')}
      title="Add Gift to Pool"
      width={460}
      subtitle={payload?.poolName}
    >
      <FormGroup label="Gift Name *">
        <input className="inp" placeholder="e.g. ₦500 Store Credit" value={name} onChange={(e) => setName(e.target.value)} />
      </FormGroup>
      <FormGroup label="Gift Description">
        <input
          className="inp"
          placeholder="Brief description for consumer-facing screens"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormGroup>
      <div className="fr2">
        <FormGroup label="Total Quantity *">
          <input
            type="number"
            className="inp"
            min={1}
            value={totalQty}
            onChange={(e) => setTotalQty(parseInt(e.target.value, 10) || 0)}
          />
        </FormGroup>
        <FormGroup label="Probability Weight">
          <input
            type="number"
            className="inp"
            min={0.1}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
          />
        </FormGroup>
      </div>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginTop: 10 }}>
          {error}
        </div>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('add-gift')} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving || !payload}>
          {saving ? 'Adding…' : 'Add Gift'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
