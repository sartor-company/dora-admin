import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import type { ApiTeamMember } from '../types/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { CONSOLE_ROLE_OPTIONS } from '../utils/consoleRoles';
import { useTenantData } from '../context/TenantDataContext';

interface EditMemberModalProps {
  open: boolean;
  member?: ApiTeamMember;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function EditMemberModal({ open, member, onClose, onSuccess }: EditMemberModalProps) {
  const { refreshTeam } = useTenantData();
  const [fullName, setFullName] = useState('');
  const [consoleRole, setConsoleRole] = useState<'batch' | 'brand' | 'inv'>('batch');
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !member) return;
    setFullName(member.fullName || '');
    setConsoleRole(member.consoleRole || 'batch');
    setBlocked(!!member.blocked);
    setError('');
  }, [open, member]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const toggleBlocked = async () => {
    if (!member) return;
    const next = !blocked;
    setSaving(true);
    setError('');
    try {
      await usersApi.update(member._id, { blocked: next });
      setBlocked(next);
      await refreshTeam();
      onSuccess(next ? 'Team member access suspended.' : 'Team member access reinstated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update member status.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!member || !fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await usersApi.update(member._id, {
        fullName: fullName.trim(),
        consoleRole,
        blocked,
      });
      await refreshTeam();
      onSuccess('Team member updated successfully.');
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update team member.');
    } finally {
      setSaving(false);
    }
  };

  if (!member) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Edit Team Member" width={460}>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <FormGroup label="Full Name">
        <input className="inp" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FormGroup>
      <FormGroup label="Email Address">
        <input className="inp" value={member.email} readOnly />
      </FormGroup>
      <FormGroup label="Console role">
        <select
          className="inp"
          value={consoleRole}
          onChange={(e) => setConsoleRole(e.target.value as typeof consoleRole)}
        >
          {CONSOLE_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormGroup>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 6 }}>
        <div className="twrap" style={{ padding: '8px 0' }}>
          <div>
            <div className="tlbl" style={{ fontSize: 12 }}>Account Status</div>
            <div className="tdesc">Member can currently log in and use the platform</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant={blocked ? 'br' : 'bg'}>{blocked ? 'Suspended' : 'Active'}</Badge>
            <Button
              variant={blocked ? 'success' : 'danger'}
              size="sm"
              disabled={saving}
              onClick={toggleBlocked}
            >
              {blocked ? 'Reinstate Access' : 'Suspend Access'}
            </Button>
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
