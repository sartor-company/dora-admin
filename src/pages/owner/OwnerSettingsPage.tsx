import { useState } from 'react';
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
import { useToast } from '../../context/ToastContext';
import { billingApi } from '../../api/billing';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { formatApiDate, invoiceStatusVariant } from '../../utils/mappers';
import { useTabs } from '../../hooks/useTabs';

type SettingsTab = 'general' | 'team' | 'billing' | 'notifications' | 'gift';

const TABS = [
  { id: 'general' as const, label: 'General' },
  { id: 'team' as const, label: 'Team' },
  { id: 'billing' as const, label: 'Billing & Credits' },
  { id: 'notifications' as const, label: 'Notifications' },
  { id: 'gift' as const, label: 'Gift Engine' },
];

export function OwnerSettingsPage() {
  const { clientType, companyName, currency, setCurrency, verifyDomain, scBand, smsCredits, pinCredits } = useApp();
  const user = useAuthStore((s) => s.user);
  const { team, products, invoices, refreshInvoices } = useTenantData();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { active, setActive } = useTabs<SettingsTab>('general');
  const [pwOld, setPwOld] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

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
              <input className="inp" defaultValue={user?.fullName || ''} readOnly />
            </FormGroup>
            <FormGroup label="Contact Email">
              <input className="inp" defaultValue={user?.email || ''} readOnly />
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
            <div style={{ padding: '11px 13px', background: 'var(--gb)', borderRadius: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--gt)', marginBottom: 4 }}>
                {clientType === 'pilot' ? 'Pilot Programme' : 'Full Deployment'} — {scBand} Band
              </div>
              <div style={{ color: 'var(--gt)', marginBottom: 6 }}>
                {user?.clientCode ? `Client code: ${user.clientCode}` : 'Client account active'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gt)' }}>
                Verification domain: {verifyDomain}
              </div>
            </div>
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
                    ✓ Starter — verify.sartor.com
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gt)', marginTop: 2 }}>
                    Sartor default domain · Active · Included at no charge
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
                    Growth Subdomain — verify-{'{code}'}.sartor.ng
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Sartor-managed subdomain with your brand theme · ₦100,000 one-time setup
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
          <Button style={{ marginTop: 6 }} onClick={() => showToast('Profile fields are managed by Sartor during onboarding.')}>
            Save Changes
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
                      <Badge variant="bb">{m.role || 'Staff'}</Badge>
                    </td>
                    <td>
                      <Badge variant={m.blocked ? 'br' : 'bg'}>{m.blocked ? 'Blocked' : 'Active'}</Badge>
                    </td>
                    <td>
                      <Button variant="secondary" size="sm" onClick={() => openModal('edit-member')}>
                        Edit
                      </Button>
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
            {[
              { title: 'PIN Authentication Credits', purchased: pinCredits, used: 0, remaining: pinCredits, pct: pinCredits > 0 ? 100 : 0, note: 'Balance from your Sartor account.' },
              { title: 'SMS Notification Credits', purchased: smsCredits, used: 0, remaining: smsCredits, pct: smsCredits > 0 ? 100 : 0, color: 'var(--amber)', remainingColor: smsCredits < 1000 ? 'var(--at)' : 'var(--gt)', note: 'Balance from your Sartor account.' },
            ].map((c) => (
              <div key={c.title} className="ccard">
                <div className="ch">
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                      Never expire while active · Protected on lapse
                    </div>
                  </div>
                  <Button size="sm" onClick={() => openModal('buy-credits')}>
                    Buy More
                  </Button>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: 7 }}>
                  <div>
                    <div style={{ color: 'var(--text3)' }}>Purchased</div>
                    <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{c.purchased}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text3)' }}>Used</div>
                    <div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{c.used}</div>
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
                      {c.remaining}
                    </div>
                  </div>
                </div>
                <ProgressBar percent={c.pct} color={c.color} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{c.note}</div>
              </div>
            ))}
          </div>
          <Card style={{ marginBottom: 12 }}>
            <CardHeader
              title="SKU Annual Licences"
              action={
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  First calibration included · No credit consumed
                </div>
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
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{row.invoiceId}</td>
                      <td>{formatApiDate(row.issuedAt || row.creationDateTime)}</td>
                      <td>{row.description}</td>
                      <td>
                        <CurrencyAmount nairaAmount={row.amount} />
                      </td>
                      <td>
                        <Badge variant={invoiceStatusVariant(row.status)}>{row.status}</Badge>
                      </td>
                      <td>
                        {(row.status === 'Pending' || row.status === 'Due Soon' || row.status === 'Overdue') && (
                          <Button variant="success" size="sm" onClick={() => payInvoice(row._id)}>
                            Pay
                          </Button>
                        )}
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
          {[
            { label: 'P1/P2 investigation alerts', desc: 'Immediate email on critical fraud flags', on: true },
            { label: 'DORA training completion', desc: 'Email when a model is ready to deploy', on: true },
            { label: 'SMS credit threshold alert (20%)', desc: 'Alert before SMS credits run low', on: true },
            { label: 'PIN credit threshold alert (20%)', desc: 'Alert before PIN credits run low', on: true },
            { label: 'SKU licence renewal reminders', desc: '30 and 7 days before each annual renewal', on: true },
            { label: 'Weekly platform summary', desc: 'Every Monday 9am WAT', on: true },
          ].map((item) => (
            <div key={item.label} className="twrap">
              <div>
                <div className="tlbl">{item.label}</div>
                <div className="tdesc">{item.desc}</div>
              </div>
              <Toggle defaultOn={item.on} />
            </div>
          ))}
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
          {[
            { label: 'Gift campaign stacking', desc: 'Allow consumers to win gifts from multiple simultaneous campaigns per scan. Default: OFF. FIRST_AUTH gifts are always awarded regardless of this setting.', on: false },
            { label: 'Consumer loyalty points (10 per auth)', desc: 'Award 10 points per authenticated post-purchase scan', on: true },
            { label: 'First authentication welcome gift (FIRST_AUTH)', desc: "Trigger gift notification on consumer's first ever authentication", on: true },
            { label: '10th authentication milestone gift', desc: "Trigger a gift on consumer's 10th authenticated product", on: true },
            { label: 'Monthly Top 10 consumers gift', desc: 'Award gifts to top 10 highest-authenticating consumers each calendar month', on: true },
          ].map((item) => (
            <div key={item.label} className="twrap">
              <div>
                <div className="tlbl">{item.label}</div>
                <div className="tdesc">{item.desc}</div>
              </div>
              <Toggle defaultOn={item.on} />
            </div>
          ))}
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
