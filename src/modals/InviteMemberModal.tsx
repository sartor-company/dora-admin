import { useState } from 'react';
import { usersApi } from '../api/users';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useTenantData } from '../context/TenantDataContext';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteMemberModal({ open, onClose, onSuccess }: InviteMemberModalProps) {
  const { refreshTeam } = useTenantData();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consoleRole, setConsoleRole] = useState<'batch' | 'brand' | 'inv'>('batch');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setConsoleRole('batch');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await usersApi.invite({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'Manager',
        consoleRole,
      });
      await refreshTeam();
      reset();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send invitation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invite Team Member" width={460}>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <FormGroup label="Full Name *">
        <input className="inp" placeholder="e.g. Adaeze Nwosu" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FormGroup>
      <FormGroup label="Email Address *">
        <input className="inp" type="email" placeholder="adaeze@yourcompany.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormGroup>
      <FormGroup label="Phone *">
        <input className="inp" placeholder="+234…" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormGroup>
      <FormGroup label="Console role *">
        <select className="inp" value={consoleRole} onChange={(e) => setConsoleRole(e.target.value as typeof consoleRole)}>
          <option value="batch">Batch Admin</option>
          <option value="brand">Brand Manager</option>
          <option value="inv">Investigation Officer</option>
        </select>
      </FormGroup>
      <FormGroup label="CRM role">
        <select className="inp" value="Manager" disabled>
          <option>Manager</option>
        </select>
      </FormGroup>
      <div style={{ padding: 9, background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 14 }}>
        ℹ An invitation email with login credentials will be sent automatically.
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Sending…' : 'Send Invitation'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
