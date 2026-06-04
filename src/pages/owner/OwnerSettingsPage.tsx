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
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { teamMembers } from '../../data/mock';
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
  const { clientType, companyName, currency, setCurrency } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { active, setActive } = useTabs<SettingsTab>('general');

  return (
    <>
      <PageHeader title="Settings" subtitle="Account Owner · Full access" />

      <TabBar tabs={TABS} active={active} onChange={(id) => setActive(id as SettingsTab)} />

      {active === 'general' && (
        <Card>
          <FormGroup label="Company Name">
            <input className="inp" defaultValue={companyName} />
          </FormGroup>
          <div className="fr2">
            <FormGroup label="RC Number">
              <input className="inp" defaultValue="RC 1234567" readOnly />
            </FormGroup>
            <FormGroup label="Industry">
              <input className="inp" defaultValue="FMCG / Personal Care" readOnly />
            </FormGroup>
          </div>
          <div className="fr2">
            <FormGroup label="Contact Name">
              <input className="inp" defaultValue="Nnamdi Okafor" />
            </FormGroup>
            <FormGroup label="Contact Email">
              <input className="inp" defaultValue="nnamdi@sartorhealth.com" />
            </FormGroup>
          </div>
          <FormGroup label="Consumer Verification URL">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="inp"
                defaultValue="https://verify-sartorhealth.sartor.ng"
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
                Full Deployment — 21–50 SKU Band (₦175,000/SKU/yr)
              </div>
              <div style={{ color: 'var(--gt)', marginBottom: 6 }}>
                Active since Jan 1, 2026 · 24 SKUs registered · Annual licence renewal: Jan 2027
              </div>
              <div style={{ fontSize: 11, color: 'var(--gt)' }}>
                Verification domain: verify.sartor.com · Starter (default)
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
          <Button style={{ marginTop: 6 }} onClick={() => showToast('Settings saved successfully')}>
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
              {teamMembers.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.name}</strong>
                  </td>
                  <td>{m.email}</td>
                  <td>
                    <Badge variant={m.roleVariant}>{m.role}</Badge>
                  </td>
                  <td>
                    <Badge variant={m.statusVariant}>{m.status}</Badge>
                  </td>
                  <td>
                    {m.invited ? (
                      <Button variant="secondary" size="sm" onClick={() => showToast('Invite resent')}>
                        Resend
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => openModal('edit-member')}>
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
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
              { title: 'Batch Calibration Credits', purchased: 30, used: 12, remaining: 18, pct: 40, color: 'var(--amber)', note: 'Professional bundle: ', noteAmount: 3600000, noteSuffix: ' / 30 credits (₦120,000/batch)' },
              { title: 'PIN Authentication Credits', purchased: '10,000', used: '1,800', remaining: '8,200', pct: 18, note: 'Entry: ', noteAmount: 150000, noteSuffix: ' / 10,000 PINs · Growth: ', noteAmount2: 600000, noteSuffix2: ' / 50,000 PINs' },
              { title: 'SMS Notification Credits', purchased: '10,000', used: '4,124', remaining: '5,876', pct: 41, color: 'var(--amber)', remainingColor: 'var(--at)', note: 'Starter: ', noteAmount: 45000, noteSuffix: ' / 10,000 SMS · Standard: ', noteAmount2: 200000, noteSuffix2: ' / 50,000 SMS' },
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
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
                  {c.note}
                  <CurrencyAmount nairaAmount={c.noteAmount} />
                  {c.noteSuffix}
                  {'noteAmount2' in c && c.noteAmount2 && (
                    <>
                      <CurrencyAmount nairaAmount={c.noteAmount2} />
                      {c.noteSuffix2}
                    </>
                  )}
                </div>
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
                  <th>Annual Fee</th>
                  <th>Status</th>
                  <th>Renewal</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: 'Sartor Hand Sanitiser 500ml', sku: 'SHS-001' },
                  { product: 'Carabiner Holder Pack', sku: 'CHP-002' },
                  { product: 'Silicone Holder/Hook Pack', sku: 'SHP-003' },
                ].map((row) => (
                  <tr key={row.sku}>
                    <td>{row.product}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{row.sku}</td>
                    <td>
                      <CurrencyAmount nairaAmount={175000} />
                    </td>
                    <td>
                      <Badge variant="bg">Active</Badge>
                    </td>
                    <td>Jan 2027</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
          </Card>
          <Card>
            <CardHeader title="Transaction History" />
            <TableWrap minWidth={520}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Apr 1, 2026', desc: 'SMS Credits — Starter (10,000)', amount: 45000 },
                  { date: 'Mar 15, 2026', desc: 'PIN Auth Credits — Entry (10,000)', amount: 150000 },
                  { date: 'Jan 1, 2026', desc: 'Annual SKU Licences — 21–50 band (24 × ₦175,000)', amount: 4200000 },
                  { date: 'Dec 1, 2025', desc: 'Batch Calibration Credits — Professional Bundle (30 credits)', amount: 3600000 },
                ].map((row) => (
                  <tr key={row.date + row.desc}>
                    <td>{row.date}</td>
                    <td>{row.desc}</td>
                    <td>
                      <CurrencyAmount nairaAmount={row.amount} />
                    </td>
                    <td>
                      <Badge variant="bg">Paid</Badge>
                    </td>
                  </tr>
                ))}
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
