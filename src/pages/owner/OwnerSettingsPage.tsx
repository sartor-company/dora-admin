import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { CurrencyAmount } from '../../components/ui/CurrencyAmount';
import { FormGroup } from '../../components/ui/FormGroup';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TabBar } from '../../components/ui/TabBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { Toggle } from '../../components/ui/Toggle';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import type { EditMemberPayload } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { billingApi } from '../../api/billing';
import { authApi } from '../../api/auth';
import { useAuthStore, DEFAULT_NOTIFICATION_PREFS, type NotificationPrefs } from '../../store/authStore';
import { formatApiDate, invoiceStatusVariant } from '../../utils/mappers';
import { skuBand } from '../../utils/skuBands';
import { teamMemberRoleLabel } from '../../utils/consoleRoles';
import { mapAccountToProfile } from '../../utils/mapAuth';
import { useTabs } from '../../hooks/useTabs';

type SettingsTab = 'general' | 'team' | 'billing' | 'notifications' | 'gift';

const TABS = [
  { id: 'general' as const, label: 'General' },
  { id: 'team' as const, label: 'Team' },
  { id: 'billing' as const, label: 'Billing & Credits' },
  { id: 'notifications' as const, label: 'Notifications' },
  { id: 'gift' as const, label: 'Gift Engine' },
];

const NOTIFICATION_ITEMS: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
  { key: 'investigationAlerts', label: 'P1/P2 investigation alerts', desc: 'Immediate email on critical fraud flags' },
  { key: 'doraTrainingComplete', label: 'DORA training completion', desc: 'Email when a model is ready to deploy' },
  { key: 'smsCreditThreshold', label: 'SMS credit threshold alert (20%)', desc: 'Alert before SMS credits run low' },
  { key: 'pinCreditThreshold', label: 'PIN credit threshold alert (20%)', desc: 'Alert before PIN credits run low' },
  { key: 'skuRenewalReminders', label: 'SKU licence renewal reminders', desc: '30 and 7 days before each annual renewal' },
  { key: 'weeklySummary', label: 'Weekly platform summary', desc: 'Every Monday 9am WAT' },
];

export function OwnerSettingsPage() {
  const { clientType, companyName, currency, setCurrency, verifyDomain, smsCredits, pinCredits, batchCalCredits, navigateTo } = useApp();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { team, products, invoices, refreshInvoices, refreshAccount, stickerOrders, refreshStickerOrders } =
    useTenantData();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { active, setActive } = useTabs<SettingsTab>('general');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [notifSaving, setNotifSaving] = useState(false);
  const [campaignStacking, setCampaignStacking] = useState(false);
  const [giftSaving, setGiftSaving] = useState(false);
  const [pwOld, setPwOld] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    setContactName(user?.contactName || user?.fullName || '');
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
    setNotifPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...user?.notificationPrefs });
    setCampaignStacking(!!user?.campaignStacking);
  }, [user]);

  useEffect(() => {
    refreshStickerOrders().catch(() => {});
  }, [refreshStickerOrders]);

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const updated = await authApi.patchAccount({
        contactName: contactName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      updateProfile(mapAccountToProfile(updated as unknown as Record<string, unknown>, user?.token || ''));
      showToast('Profile saved successfully.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const saveNotificationPrefs = async (next: NotificationPrefs) => {
    setNotifPrefs(next);
    setNotifSaving(true);
    try {
      const updated = await authApi.patchAccount({ notificationPrefs: next });
      updateProfile(mapAccountToProfile(updated as unknown as Record<string, unknown>, user?.token || ''));
      showToast('Notification preferences saved.', 'success');
    } catch (e) {
      setNotifPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...user?.notificationPrefs });
      showToast(e instanceof Error ? e.message : 'Could not save preferences.', 'error');
    } finally {
      setNotifSaving(false);
    }
  };

  const saveGiftConfig = async (stacking: boolean) => {
    setCampaignStacking(stacking);
    setGiftSaving(true);
    try {
      const updated = await authApi.patchAccount({ campaignStacking: stacking });
      updateProfile(mapAccountToProfile(updated as unknown as Record<string, unknown>, user?.token || ''));
      await refreshAccount();
      showToast('Gift engine settings saved.', 'success');
    } catch (e) {
      setCampaignStacking(!!user?.campaignStacking);
      showToast(e instanceof Error ? e.message : 'Could not save gift settings.', 'error');
    } finally {
      setGiftSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwOld || !pw1 || pw1 !== pw2) {
      showToast(pw1 !== pw2 ? 'New passwords do not match.' : 'Fill in all password fields.', 'warn');
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword(pwOld, pw1, pw2);
      setPwOld('');
      setPw1('');
      setPw2('');
      showToast('Password updated successfully.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not update password.', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const payInvoice = async (invoiceId: string) => {
    try {
      const result = await billingApi.initializePayment(invoiceId, user?.email);
      if (result.authorization_url) {
        window.open(result.authorization_url, '_blank', 'noopener,noreferrer');
        showToast('Complete payment in the Paystack window.', 'success');
      } else {
        showToast('Online payment not available — contact Sartor to pay this invoice.', 'warn');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not start payment.', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Account Owner · Full access" />

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as SettingsTab)} />

      {active === 'general' && (
        <Card>
          <FormGroup label="Company Name">
            <input className="inp" defaultValue={companyName} readOnly />
          </FormGroup>
          <div className="fr2">
            <FormGroup label="RC Number">
              <input className="inp" defaultValue={user?.rcNumber || '—'} readOnly />
            </FormGroup>
            <FormGroup label="Industry">
              <input className="inp" defaultValue={user?.industry || '—'} readOnly />
            </FormGroup>
          </div>
          <div className="fr2">
            <FormGroup label="Contact Name">
              <input className="inp" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </FormGroup>
            <FormGroup label="Contact Email">
              <input className="inp" defaultValue={user?.email || ''} readOnly />
            </FormGroup>
          </div>
          <div className="fr2">
            <FormGroup label="Phone">
              <input className="inp" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormGroup>
            <FormGroup label="Address">
              <input className="inp" value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormGroup>
          </div>
          <FormGroup label="Consumer Verification URL">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="inp"
                defaultValue={`https://${verifyDomain}`}
                readOnly
                style={{ flex: 1 }}
              />
              <a
                href="https://verify.dorascan.ai"
                target="_blank"
                rel="noreferrer"
                className="btn bsec bsm"
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                ↗ Preview
              </a>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
              🔒 Set by your Sartor account manager. Powered by DORA AI at{' '}
              <a href="https://verify.dorascan.ai" target="_blank" style={{ color: 'var(--bt)' }}>
                verify.dorascan.ai
              </a>
              . Contact support@sartor.ng to request a domain change.
            </div>
          </FormGroup>
          <FormGroup label="Platform Engagement">
            {(() => {
              const skuCount = products.length;
              const band = skuBand(skuCount);
              const rateLabel = band.rate != null ? `₦${band.rate.toLocaleString()}/SKU/yr` : 'Custom pricing';
              return (
                <div style={{ padding: '11px 13px', background: 'var(--gb)', borderRadius: 8, fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--gt)', marginBottom: 4 }}>
                    {clientType === 'pilot'
                      ? `Pilot Programme — ${band.name}`
                      : `Full Deployment — ${band.name} (${rateLabel})`}
                  </div>
                  <div style={{ color: 'var(--gt)', marginBottom: 6 }}>
                    {clientType === 'pilot' ? (
                      <>
                        90-day trial · Full platform access · Pilot fee credited on conversion to Full Deployment
                      </>
                    ) : (
                      <>
                        Active since{' '}
                        {(() => {
                          const times = products
                            .map((p) => p.creationDateTime)
                            .filter((t): t is number => typeof t === 'number');
                          return times.length > 0 ? formatApiDate(Math.min(...times)) : 'Jan 1, 2026';
                        })()}{' '}
                        · {skuCount} SKU
                        {skuCount !== 1 ? 's' : ''} registered · Annual licence renewal:{' '}
                        {user?.skuRenewalLabel || 'Jan 2027'}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gt)' }}>
                    Verification domain: {verifyDomain}
                    {clientType === 'pilot' ? ' (default)' : ' (default for all accounts)'}
                  </div>
                  {clientType !== 'pilot' && (
                    <Button variant="secondary" size="sm" style={{ marginTop: 8 }} onClick={() => openModal('add-sku-licences')}>
                      + Add SKU Licences
                    </Button>
                  )}
                </div>
              );
            })()}
          </FormGroup>
          <FormGroup label="Verification Domain">
            <div style={{ border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '11px 13px',
                  background: 'var(--gb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gt)' }}>
                    ✓ Starter — verify.dorascan.ai
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gt)', marginTop: 2 }}>
                    DORASCAN default domain · Active · Included at no charge
                  </div>
                </div>
                <Badge variant="bg">Active</Badge>
              </div>
              <div
                style={{
                  padding: '11px 13px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    Growth Subdomain — verify-{'{name}'}.dorascan.ai
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Brand-themed verification hostname · ₦100,000 setup + ₦50,000/yr
                  </div>
                </div>
                <Button variant="secondary" size="sm" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => openModal('domain-upgrade')}>
                  Request Upgrade
                </Button>
              </div>
              <div
                style={{
                  padding: '11px 13px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    Enterprise CNAME — verify.yourdomain.com
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Your own domain pointing to Sartor · ₦150,000 setup + ₦200,000/yr · DNS
                    coordination required
                  </div>
                </div>
                <Button variant="secondary" size="sm" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => openModal('domain-upgrade')}>
                  Request Upgrade
                </Button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
              🔒 Domain upgrades are activated by Sartor. Contact <strong>support@sartor.ng</strong>{' '}
              or your account manager to request an upgrade.
            </div>
          </FormGroup>
          <FormGroup
            label="Display Currency"
            hint="Sets the currency shown across all billing, credits and pricing screens. Exchange rates updated daily."
          >
            <select
              className="inp"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
            >
              <option value="NGN">NGN — Nigerian Naira (₦)</option>
              <option value="GHS">GHS — Ghanaian Cedi (₵)</option>
              <option value="KES">KES — Kenyan Shilling (KSh)</option>
              <option value="ZAR">ZAR — South African Rand (R)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="EUR">EUR — Euro (€)</option>
            </select>
          </FormGroup>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
            <div className="ct" style={{ marginBottom: 12, fontSize: 14 }}>
              Change Password
            </div>
            <FormGroup label="Current Password">
              <input
                className="inp"
                type="password"
                value={pwOld}
                onChange={(e) => setPwOld(e.target.value)}
                autoComplete="current-password"
              />
            </FormGroup>
            <div className="fr2">
              <FormGroup label="New Password">
                <input
                  className="inp"
                  type="password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  autoComplete="new-password"
                />
              </FormGroup>
              <FormGroup label="Confirm Password">
                <input
                  className="inp"
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  autoComplete="new-password"
                />
              </FormGroup>
            </div>
            <Button variant="secondary" onClick={changePassword} disabled={pwSaving}>
              {pwSaving ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
          <Button style={{ marginTop: 6 }} onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Card>
      )}

      {active === 'team' && (
        <Card>
          <CardHeader
            title="Team Members"
            action={
              <Button size="sm" onClick={() => openModal('invite-member')}>
                + Invite Member
              </Button>
            }
          />
          <div
            style={{
              fontSize: 11,
              color: 'var(--bt)',
              background: 'var(--bb)',
              padding: '7px 11px',
              borderRadius: 6,
              marginBottom: 11,
            }}
          >
            Valid roles: Account Owner · Batch Admin · Brand Manager · Investigation Officer
          </div>
          <TableWrap minWidth={640}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>
                    No team members yet. Invite your first team member.
                  </td>
                </tr>
              ) : (
                team.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <strong>{m.fullName}</strong>
                    </td>
                    <td>{m.email}</td>
                    <td>
                      <Badge variant={m.isOwner || m.consoleRole === 'owner' ? 'bp' : 'bb'}>
                        {teamMemberRoleLabel(m)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={m.blocked ? 'br' : 'bg'}>{m.blocked ? 'Blocked' : 'Active'}</Badge>
                    </td>
                    <td>
                      {m.isOwner || m.consoleRole === 'owner' ? (
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>—</span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModal('edit-member', { member: m } satisfies EditMemberPayload)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </TableWrap>
        </Card>
      )}

      {active === 'billing' && (
        <>
          {clientType === 'pilot' && (
            <div
              style={{
                padding: '10px 13px',
                background: '#fff8f6',
                border: '1px solid #FF5C35',
                borderRadius: 8,
                marginBottom: 14,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: '#D64000', marginBottom: 4 }}>
                🎓 Pilot Programme Billing
              </div>
              <div style={{ color: 'var(--text2)' }}>
                Pilot fee paid: <strong>₦3,500,000</strong> · No SKU annual licences or credit bundles
                are invoiced during the pilot period — all credits are provided as part of the pilot
                package.
                <br />
                On converting to Full Deployment: pilot fee is credited in full against the ₦4,500,000
                onboarding fee, giving an effective cost of <strong>₦1,000,000</strong>.
              </div>
            </div>
          )}
          <div className="credits-grid">
            {(() => {
              const pinPurchased = invoices
                .filter((i) => i.status === 'Paid' && i.creditType === 'pin')
                .reduce((s, i) => s + (i.creditQuantity || 0), 0);
              const smsPurchased = invoices
                .filter((i) => i.status === 'Paid' && i.creditType === 'sms')
                .reduce((s, i) => s + (i.creditQuantity || 0), 0);
              const batchPurchased = invoices
                .filter((i) => i.status === 'Paid' && i.creditType === 'batch')
                .reduce((s, i) => s + (i.creditQuantity || 0), 0);

              const pinReserved = stickerOrders
                .filter((r) => r.status !== 'Activated')
                .reduce((sum, r) => sum + r.pins, 0);
              const pinUsed = Math.max(0, Math.max(pinPurchased, pinCredits + pinReserved) - pinCredits);
              const smsUsed = Math.max(0, Math.max(smsPurchased, smsCredits) - smsCredits);
              // Prefer invoice-funded view when history exists; otherwise show available balance only.
              const pinTotal = Math.max(pinPurchased, pinCredits + pinUsed);
              const smsTotal = Math.max(smsPurchased, smsCredits + smsUsed);
              const batchTotal = Math.max(batchPurchased, batchCalCredits);
              const batchUsed = Math.max(0, batchTotal - batchCalCredits);

              const cards = [
                {
                  title: 'PIN Authentication Credits',
                  purchased: pinTotal,
                  used: pinUsed,
                  remaining: pinCredits,
                  pct: pinTotal > 0 ? Math.round((pinCredits / pinTotal) * 100) : 0,
                  note:
                    pinReserved > 0
                      ? `${pinReserved.toLocaleString()} reserved on open sticker orders · Available shown as Remaining.`
                      : 'Remaining is your spendable PIN balance.',
                  tab: 'pin' as const,
                },
                {
                  title: 'SMS Notification Credits',
                  purchased: smsTotal,
                  used: smsUsed,
                  remaining: smsCredits,
                  pct: smsTotal > 0 ? Math.round((smsCredits / smsTotal) * 100) : 0,
                  color: 'var(--amber)',
                  remainingColor: smsCredits < 1000 ? 'var(--at)' : 'var(--gt)',
                  note: 'Used is inferred from paid invoices vs current balance (pilot grants may not appear as invoices).',
                  tab: 'sms' as const,
                },
                {
                  title: 'Batch Calibration Credits',
                  purchased: batchTotal,
                  used: batchUsed,
                  remaining: batchCalCredits,
                  pct: batchTotal > 0 ? Math.round((batchCalCredits / batchTotal) * 100) : 0,
                  note: '1 credit is consumed when you activate a sticker batch.',
                  tab: 'cal' as const,
                },
              ];

                  return cards.map((c) => (
              <div key={c.title} className="ccard">
                <div className="ch">
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                      Never expire while active · Protected on lapse
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openModal('buy-credits', { tab: c.tab })}
                  >
                    Buy More
                  </Button>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: 7 }}>
                  <div>
                    <div style={{ color: 'var(--text3)' }}>Funded / basis</div>
                    <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                      {c.purchased.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text3)' }}>Used</div>
                    <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                      {c.used.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text3)' }}>Remaining</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        color: c.remainingColor ?? 'var(--gt)',
                      }}
                    >
                      {c.remaining.toLocaleString()}
                    </div>
                  </div>
                </div>
                <ProgressBar percent={c.pct} color={c.color} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{c.note}</div>
              </div>
              ));
            })()}
          </div>
          <Card style={{ marginBottom: 12 }}>
            <CardHeader
              title="SKU Annual Licences"
              action={
                <Button variant="secondary" size="sm" onClick={() => openModal('add-sku-licences')}>
                  + Add SKU Licences
                </Button>
              }
            />
            <TableWrap minWidth={560}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                      No products registered yet.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td>{p.productName}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{p.batchId || p.barcodeNumber || '—'}</td>
                      <td>
                        <Badge variant={p.status === 'In-Stock' ? 'bg' : 'ba'}>{p.status || 'Active'}</Badge>
                      </td>
                      <td>{formatApiDate(p.creationDateTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </TableWrap>
          </Card>
          <Card>
            <CardHeader
              title="Transaction History"
              action={
                <Button variant="secondary" size="sm" onClick={() => refreshInvoices()}>
                  Refresh
                </Button>
              }
            />
            <TableWrap minWidth={520}>
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                      No invoices yet. Invoices from onboarding and billing appear here.
                    </td>
                  </tr>
                ) : (
                  invoices.map((row) => (
                    <tr key={row._id}>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                        <button
                          type="button"
                          onClick={() =>
                            openModal('invoice-view', {
                              _id: row._id,
                              invoiceId: row.invoiceId,
                              description: row.description,
                              amount: row.amount,
                              status: row.status,
                              issuedAt: row.issuedAt,
                              creationDateTime: row.creationDateTime,
                            })
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'var(--bt)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {row.invoiceId}
                        </button>
                      </td>
                      <td>{formatApiDate(row.issuedAt || row.creationDateTime)}</td>
                      <td>{row.description}</td>
                      <td>
                        <CurrencyAmount nairaAmount={row.amount} />
                      </td>
                      <td>
                        <Badge variant={invoiceStatusVariant(row.status)}>{row.status}</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              openModal('invoice-view', {
                                _id: row._id,
                                invoiceId: row.invoiceId,
                                description: row.description,
                                amount: row.amount,
                                status: row.status,
                                issuedAt: row.issuedAt,
                                creationDateTime: row.creationDateTime,
                              })
                            }
                          >
                            View
                          </Button>
                          {(row.status === 'Pending' || row.status === 'Due Soon' || row.status === 'Overdue') && (
                            <Button variant="success" size="sm" onClick={() => payInvoice(row._id)}>
                              Pay
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </TableWrap>
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
              ℹ Credits never expire while your subscription is active. Credits are placed in
              protected suspension if subscription lapses and reinstated in full upon renewal — they
              are never forfeited.
            </div>
          </Card>
        </>
      )}

      {active === 'notifications' && (
        <Card>
          {NOTIFICATION_ITEMS.map((item) => (
            <div key={item.key} className="twrap">
              <div>
                <div className="tlbl">{item.label}</div>
                <div className="tdesc">{item.desc}</div>
              </div>
              <Toggle
                on={notifPrefs[item.key]}
                onChange={(on) =>
                  saveNotificationPrefs({ ...notifPrefs, [item.key]: on })
                }
              />
            </div>
          ))}
          {notifSaving && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Saving…</div>
          )}
        </Card>
      )}

      {active === 'gift' && (
        <Card>
          <div className="ct" style={{ marginBottom: 4 }}>
            Gift Engine Configuration
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 13 }}>
            Controls how loyalty campaigns and gift distribution behave for your consumers.
          </div>
          <div className="twrap">
            <div>
              <div className="tlbl">Gift campaign stacking</div>
              <div className="tdesc">
                Allow consumers to win gifts from multiple simultaneous campaigns per scan. Default: OFF. FIRST_AUTH gifts are always awarded regardless of this setting.
              </div>
            </div>
            <Toggle
              on={campaignStacking}
              onChange={(on) => saveGiftConfig(on)}
            />
          </div>
          {[
            {
              label: 'Consumer loyalty points (10 per auth)',
              desc: 'Awarded automatically by the consumer verification flow when points are enabled on scan records.',
            },
            {
              label: 'FIRST_AUTH / milestone / monthly-top gifts',
              desc: 'Configured per campaign in Gift Engine (trigger type + pool). Manage live campaigns under Gifts.',
            },
          ].map((item) => (
            <div key={item.label} className="twrap">
              <div>
                <div className="tlbl">{item.label}</div>
                <div className="tdesc">{item.desc}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Campaign-driven</span>
            </div>
          ))}
          <div style={{ marginTop: 4 }}>
            <Button variant="secondary" size="sm" onClick={() => navigateTo('/gifts')}>
              Open Gift Engine →
            </Button>
          </div>
          {giftSaving && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Saving…</div>
          )}
          <div
            style={{
              padding: 10,
              background: 'var(--ab)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--at)',
              marginTop: 12,
            }}
          >
            ⚠ Sartor&apos;s role is fulfilment notification only. You are solely responsible for
            procuring, funding, and dispatching all physical or digital rewards to consumers. Sartor
            bears no liability for unfulfilled, delayed, or disputed rewards.
          </div>
        </Card>
      )}
    </>
  );
}
