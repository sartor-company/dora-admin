import { useEffect, useState } from 'react';
import { giftsApi } from '../api/gifts';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useModal, type CampaignActionPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';

interface Props {
  onPauseSuccess: () => void;
  onEndSuccess: () => void;
}

export function CampaignPauseModal({ onPauseSuccess }: Pick<Props, 'onPauseSuccess'>) {
  const { isOpen, closeModal, getPayload } = useModal();
  const { refreshCampaigns, notifyGiftChange } = useTenantData();
  const { showToast } = useToast();
  const open = isOpen('pause-warn');
  const payload = getPayload<CampaignActionPayload>('pause-warn');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) setSaving(false);
  }, [open]);

  const submit = async () => {
    if (!payload?.campaignId) return;
    setSaving(true);
    try {
      await giftsApi.pauseCampaign(payload.campaignId);
      await refreshCampaigns();
      notifyGiftChange();
      closeModal('pause-warn');
      onPauseSuccess();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to pause campaign.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={() => closeModal('pause-warn')} title="Pause Campaign?" width={440}>
      <div style={{ padding: 12, background: 'var(--ab)', borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--at)', marginBottom: 6 }}>⚠ Auth counts will freeze</div>
        <div style={{ fontSize: 13, color: 'var(--at)' }}>
          Consumers will not accumulate progress toward milestones during the pause period.
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
        Pause <strong>{payload?.campaignName || 'this campaign'}</strong>?
      </p>
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('pause-warn')} disabled={saving}>
          Cancel
        </Button>
        <Button variant="amber" onClick={submit} disabled={saving || !payload?.campaignId}>
          {saving ? 'Pausing…' : 'Pause Campaign'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function CampaignEndModal({ onEndSuccess }: Pick<Props, 'onEndSuccess'>) {
  const { isOpen, closeModal, getPayload } = useModal();
  const { refreshCampaigns, notifyGiftChange } = useTenantData();
  const open = isOpen('end-warn');
  const payload = getPayload<CampaignActionPayload>('end-warn');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setConfirm('');
    setError('');
    setSaving(false);
  }, [open, payload?.campaignId]);

  const submit = async () => {
    if (!payload?.campaignId) return;
    if (confirm !== 'END') {
      setError('Type END to confirm.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await giftsApi.endCampaign(payload.campaignId);
      await refreshCampaigns();
      notifyGiftChange();
      closeModal('end-warn');
      onEndSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not end campaign.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={() => closeModal('end-warn')} title="End Campaign?" width={440}>
      <div style={{ padding: 12, background: 'var(--rb)', borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--rt)', marginBottom: 6 }}>⚠ This action is permanent</div>
        <div style={{ fontSize: 13, color: 'var(--rt)' }}>
          {payload?.pendingStock != null
            ? `All remaining PENDING_STOCK events (${payload.pendingStock} consumers) will be automatically VOIDED.`
            : 'All remaining pending stock events will be automatically VOIDED.'}
        </div>
      </div>
      <FormGroup label="Type END to confirm">
        <input
          className="inp"
          placeholder="Type END to confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </FormGroup>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <ModalFooter>
        <Button variant="secondary" onClick={() => closeModal('end-warn')} disabled={saving}>
          Cancel
        </Button>
        <Button variant="danger" onClick={submit} disabled={saving || !payload?.campaignId}>
          {saving ? 'Ending…' : 'End Campaign Permanently'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
