import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth';
import { usersApi } from '../../api/users';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FormGroup } from '../ui/FormGroup';
import { Toggle } from '../ui/Toggle';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { useTenantData } from '../../context/TenantDataContext';
import { teamMemberRoleLabel } from '../../utils/consoleRoles';

export interface StaffNotificationItem {
  key: string;
  label: string;
  desc: string;
  defaultOn?: boolean;
}

interface Props {
  roleSubtitle: string;
  notificationItems: StaffNotificationItem[];
  showCredits?: boolean;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { first: parts[0] || '', last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function StaffSettingsForm({ roleSubtitle, notificationItems, showCredits }: Props) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { showToast } = useToast();
  const { refreshAccount } = useTenantData();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [pwOld, setPwOld] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'usage'>('profile');

  useEffect(() => {
    if (!user?._id || user.accountType === 'admin') return;
    let cancelled = false;
    usersApi
      .getProfile()
      .then((profile) => {
        if (cancelled) return;
        updateProfile({
          fullName: profile.fullName,
          displayName: profile.fullName,
          phone: profile.phone,
          notificationPrefs: profile.notificationPrefs as typeof user.notificationPrefs,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?._id, user?.accountType, updateProfile]);

  useEffect(() => {
    const name = user?.displayName || user?.fullName || '';
    const { first, last } = splitName(name);
    setFirstName(first);
    setLastName(last);
    setPhone(user?.phone || '');
    const stored = (user as { notificationPrefs?: Record<string, boolean> })?.notificationPrefs || {};
    const initial: Record<string, boolean> = {};
    notificationItems.forEach((item) => {
      initial[item.key] = stored[item.key] ?? item.defaultOn ?? false;
    });
    setPrefs(initial);
  }, [user, notificationItems]);

  const saveProfile = async () => {
    if (!user?._id) return;
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fullName) {
      showToast('Name is required.');
      return;
    }
    setProfileSaving(true);
    try {
      if (user.accountType === 'admin') {
        const updated = await authApi.patchAccount({ contactName: fullName, phone: phone.trim() });
        updateProfile({ fullName: updated.fullName, contactName: updated.contactName, phone: updated.phone });
        await refreshAccount();
      } else {
        const updated = await usersApi.updateProfile(user._id, { fullName, phone: phone.trim() });
        updateProfile({
          fullName: updated.fullName,
          displayName: updated.fullName,
          phone: updated.phone,
        });
      }
      if (pwOld || pw1 || pw2) {
        if (!pwOld || !pw1 || pw2.length < 8) {
          showToast('Enter current password and a new password (min 8 characters).');
          return;
        }
        if (pw1 !== pw2) {
          showToast('New passwords do not match.');
          return;
        }
        await authApi.changePassword(pwOld, pw1, pw2);
        setPwOld('');
        setPw1('');
        setPw2('');
      }
      showToast('Settings saved successfully', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save settings.');
    } finally {
      setProfileSaving(false);
    }
  };

  const saveNotifications = async () => {
    if (!user?._id) return;
    setNotifSaving(true);
    try {
      if (user.accountType === 'admin') {
        await authApi.patchAccount({ notificationPrefs: prefs });
        updateProfile({ notificationPrefs: prefs as never });
      } else {
        await usersApi.updateProfile(user._id, { notificationPrefs: prefs });
        updateProfile({ notificationPrefs: prefs as never });
      }
      showToast('Notification preferences saved', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save notifications.');
    } finally {
      setNotifSaving(false);
    }
  };

  const roleLabel =
    user?.accountType === 'admin'
      ? 'Account Owner'
      : teamMemberRoleLabel({
          _id: user?._id || '',
          fullName: user?.fullName || '',
          email: user?.email || '',
          consoleRole: user?.consoleRole === 'owner' ? 'batch' : user?.consoleRole,
        });

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['profile', 'notifications', ...(showCredits ? (['usage'] as const) : [])] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'tab on' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'profile' ? 'My Profile' : tab === 'notifications' ? 'Notifications' : 'Credit Balances'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <div className="fr2">
            <FormGroup label="First Name">
              <input className="inp" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </FormGroup>
            <FormGroup label="Last Name">
              <input className="inp" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </FormGroup>
          </div>
          <FormGroup label="Email Address" hint={user?.accountType === 'user' ? 'Contact your Account Owner to change email.' : undefined}>
            <input className="inp" value={user?.email || ''} readOnly />
          </FormGroup>
          <FormGroup label="Role">
            <input className="inp" value={`${roleLabel} · ${roleSubtitle}`} readOnly />
          </FormGroup>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 6 }}>
            <FormGroup label="Current Password">
              <input
                className="inp"
                type="password"
                placeholder="Enter current password"
                value={pwOld}
                onChange={(e) => setPwOld(e.target.value)}
              />
            </FormGroup>
            <div className="fr2">
              <FormGroup label="New Password">
                <input
                  className="inp"
                  type="password"
                  placeholder="Min 8 characters"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Confirm">
                <input
                  className="inp"
                  type="password"
                  placeholder="Repeat password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <Button style={{ marginTop: 6 }} onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          {notificationItems.map((item) => (
            <div key={item.key} className="twrap">
              <div>
                <div className="tlbl">{item.label}</div>
                <div className="tdesc">{item.desc}</div>
              </div>
              <Toggle
                on={prefs[item.key] ?? false}
                onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
              />
            </div>
          ))}
          <Button style={{ marginTop: 10 }} onClick={saveNotifications} disabled={notifSaving}>
            {notifSaving ? 'Saving…' : 'Save Notification Preferences'}
          </Button>
        </Card>
      )}

      {activeTab === 'usage' && showCredits && (
        <Card>
          <div className="stack-3">
            {[
              { label: 'Batch Calibration', value: String(user?.batchCalCredits ?? '—'), sub: 'credits remaining' },
              { label: 'PIN Authentication', value: (user?.pinCredits ?? 0).toLocaleString(), sub: 'credits remaining' },
              { label: 'SMS Notifications', value: (user?.smsCredits ?? 0).toLocaleString(), sub: 'credits remaining', accent: true },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  padding: 11,
                  background: c.accent ? 'var(--ab)' : 'var(--bg)',
                  borderRadius: 7,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, color: c.accent ? 'var(--at)' : 'var(--text3)', marginBottom: 4 }}>{c.label}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    color: c.accent ? 'var(--at)' : undefined,
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 10, color: c.accent ? 'var(--at)' : 'var(--text3)' }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: 9,
              background: 'var(--bb)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--bt)',
              marginTop: 11,
            }}
          >
            ℹ Credits never expire while subscription is active. Contact your Account Owner to purchase more.
          </div>
        </Card>
      )}
    </>
  );
}
