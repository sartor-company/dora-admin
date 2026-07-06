import { useState } from 'react';
import { CURRENCIES } from '../constants/currency';
import { useApp } from '../context/AppContext';
import { useTenantData } from '../context/TenantDataContext';
import { giftsApi } from '../api/gifts';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { Toggle } from '../components/ui/Toggle';
import type { CurrencyCode } from '../types';
import { BatchCreateModal } from './BatchCreateModal';
import { BuyCreditsModal } from './BuyCreditsModal';
import { CampaignWizardModal } from './CampaignWizardModal';
import { DoraUploadModal } from './DoraUploadModal';
import { InviteMemberModal } from './InviteMemberModal';
import { ProductCreateModal } from './ProductCreateModal';

export function ModalsRoot() {
  const { isOpen, closeModal } = useModal();
  const { currency, setCurrency } = useApp();
  const { doraUploadTarget, refreshBatches, products, refreshCampaigns } = useTenantData();
  const { showToast } = useToast();

  const close = (id: Parameters<typeof closeModal>[0]) => () => closeModal(id);

  return (
    <>
      <CurrencyModal
        open={isOpen('currency')}
        onClose={close('currency')}
        current={currency}
        onSelect={(c) => {
          setCurrency(c);
          closeModal('currency');
        }}
      />

      <ProductCreateModal
        open={isOpen('product')}
        onClose={close('product')}
        onSuccess={() => {
          closeModal('product');
          showToast('Product created successfully!', 'success');
        }}
      />

      <BatchCreateModal
        open={isOpen('batch')}
        onClose={close('batch')}
        onSuccess={() => {
          closeModal('batch');
          showToast('Batch created! Upload DORA training images when ready.', 'success');
        }}
      />

      <DoraUploadModal
        open={isOpen('dora')}
        onClose={close('dora')}
        target={doraUploadTarget}
        onSubmit={async () => {
          closeModal('dora');
          await refreshBatches();
          showToast('DORA training images submitted. Model training will begin shortly.', 'success');
        }}
      />

      <InviteMemberModal
        open={isOpen('invite-member')}
        onClose={close('invite-member')}
        onSuccess={() => {
          closeModal('invite-member');
          showToast('Invitation sent. They will receive an email to set their password.', 'success');
        }}
      />

      <EditMemberModal open={isOpen('edit-member')} onClose={close('edit-member')} showToast={showToast} />

      <BuyCreditsModal
        open={isOpen('buy-credits')}
        onClose={close('buy-credits')}
        onSubmit={() => {
          closeModal('buy-credits');
          showToast('Purchase request submitted. An invoice will be emailed within 1 business day.');
        }}
      />

      <ReportsModal open={isOpen('reports')} onClose={close('reports')} showToast={showToast} />

      <Modal open={isOpen('flag-batch-inv')} onClose={close('flag-batch-inv')} title="Flag Batch" width={460}>
        <div style={{ padding: 12, background: 'var(--rb)', borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rt)', marginBottom: 4 }}>
            ⚠ This will lock BATCH-038 for loyalty point accumulation
          </div>
          <div style={{ fontSize: 12, color: 'var(--rt)' }}>
            Consumers scanning products from this batch will not earn loyalty points until resolved.
          </div>
        </div>
        <FormGroup label="Flag Severity">
          <select className="inp">
            <option>P1 — Critical (batch mismatch / confirmed fraud)</option>
            <option>P2 — High (cloned PIN suspicion)</option>
            <option>P3 — Medium (pattern anomaly)</option>
          </select>
        </FormGroup>
        <FormGroup label="Flag Reason *">
          <textarea className="inp" rows={3} placeholder="Describe the reason for flagging this batch..." style={{ resize: 'vertical' }} />
        </FormGroup>
        <div className="twrap" style={{ padding: '8px 0' }}>
          <div>
            <div className="tlbl" style={{ fontSize: 12 }}>Notify Account Owner</div>
            <div className="tdesc">Send immediate email alert to Nnamdi Okafor</div>
          </div>
          <Toggle defaultOn />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={close('flag-batch-inv')}>Cancel</Button>
          <Button variant="danger" onClick={() => { closeModal('flag-batch-inv'); showToast('BATCH-038 flagged. Investigation updated. Account Owner notified.'); }}>Flag Batch</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('clear-fp')} onClose={close('clear-fp')} title="Clear as False Positive" width={440}>
        <div style={{ padding: 12, background: 'var(--gb)', borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gt)', marginBottom: 4 }}>
            ✓ This will resolve INV-087 as a false positive
          </div>
          <div style={{ fontSize: 12, color: 'var(--gt)' }}>
            The investigation will be closed and marked CLEARED. Any batch lock will be lifted.
          </div>
        </div>
        <FormGroup label="Clearance Reason *">
          <select className="inp">
            <option>Device/location inconsistency explained</option>
            <option>Consumer verified identity — genuine purchase confirmed</option>
            <option>QR scan error (label damage / camera issue)</option>
            <option>Retailer internal testing scan</option>
            <option>Other (explain below)</option>
          </select>
        </FormGroup>
        <FormGroup label="Notes">
          <textarea className="inp" rows={2} placeholder="Optional additional notes..." style={{ resize: 'vertical' }} />
        </FormGroup>
        <ModalFooter>
          <Button variant="secondary" onClick={close('clear-fp')}>Cancel</Button>
          <Button variant="success" onClick={() => { closeModal('clear-fp'); showToast('INV-087 cleared as false positive. Batch lock lifted.'); }}>Clear as False Positive</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('evidence-bundle')} onClose={close('evidence-bundle')} title="Generate Evidence Bundle" width={460}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Compiles all forensic data for INV-087 into a structured PDF/ZIP for regulatory or legal submission.
        </div>
        <div style={{ display: 'grid', gap: 7, marginBottom: 14, fontSize: 12 }}>
          {[
            'DORA AI feature score breakdown (F1–F5)',
            'Scan timestamp, GPS coordinates, device fingerprint',
            'Batch origin data and serial number manifest',
            'Investigation timeline and officer notes',
            'Cryptographic hash of DORA model at scan time',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'var(--gb)', borderRadius: 6 }}>
              <span style={{ color: 'var(--gt)' }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <FormGroup label="Intended Recipient">
          <select className="inp">
            <option>Internal record only</option>
            <option>NAFDAC</option>
            <option>Nigerian Police Force</option>
            <option>Legal counsel</option>
            <option>Other</option>
          </select>
        </FormGroup>
        <ModalFooter>
          <Button variant="secondary" onClick={close('evidence-bundle')}>Cancel</Button>
          <Button onClick={() => { closeModal('evidence-bundle'); showToast('Evidence bundle generated. Download link sent to nnamdi@sartorhealth.com.'); }}>Generate Bundle</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('batch-download')} onClose={close('batch-download')} title="Download Batch Package" width={460} subtitle="BATCH-042 · Sartor Hand Sanitiser 500ml · 600 units">
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Your batch print package is a ZIP file containing everything needed to print and serialise this batch.
        </div>
        <div style={{ display: 'grid', gap: 6, marginBottom: 14, fontSize: 12 }}>
          {[
            ['PIN manifest (CSV) · 600 unique PINs', 'Included'],
            ['Serial number manifest (CSV) · 600 SN-PIN pairs', 'Included'],
            ['SKU QR code image (PNG) · for label printing', 'Included'],
            ['Carton QR label (A6 PDF) · 25 cartons', 'Included'],
            ['Batch summary sheet (PDF)', 'Included'],
          ].map(([label, badge]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 9, background: 'var(--bg)', borderRadius: 6 }}>
              <span>{label}</span>
              <Badge variant="bg">{badge}</Badge>
            </div>
          ))}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={close('batch-download')}>Cancel</Button>
          <Button onClick={() => { closeModal('batch-download'); showToast('BATCH-042 print package downloaded successfully.'); }}>↓ Download ZIP Package</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('batch-pause')} onClose={close('batch-pause')} title="Pause Batch?" width={440}>
        <div style={{ padding: 12, background: 'var(--ab)', borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--at)', marginBottom: 4 }}>
            ⚠ Consumer scans will continue but loyalty points will not accumulate
          </div>
          <div style={{ fontSize: 12, color: 'var(--at)' }}>
            Pausing suspends loyalty point awards and gift eligibility for BATCH-042. Unpause at any time.
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Are you sure you want to pause <strong>BATCH-042</strong>?
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={close('batch-pause')}>Cancel</Button>
          <Button variant="amber" onClick={() => { closeModal('batch-pause'); showToast('BATCH-042 paused. Loyalty accumulation suspended.'); }}>Pause Batch</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('batch-flag')} onClose={close('batch-flag')} title="Flag Batch for Investigation" width={440}>
        <div style={{ padding: 12, background: 'var(--rb)', borderRadius: 8, marginBottom: 14, fontSize: 13, color: 'var(--rt)' }}>
          Flagging creates a new investigation record and notifies your Investigation Officer. The batch will be locked for loyalty accumulation.
        </div>
        <FormGroup label="Reason for flagging">
          <textarea className="inp" rows={3} placeholder="Describe the suspected issue..." style={{ resize: 'vertical' }} />
        </FormGroup>
        <div className="twrap" style={{ padding: '8px 0' }}>
          <div>
            <div className="tlbl" style={{ fontSize: 12 }}>Notify Investigation Officer</div>
            <div className="tdesc">Send immediate alert to Emeka Okafor</div>
          </div>
          <Toggle defaultOn />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={close('batch-flag')}>Cancel</Button>
          <Button variant="danger" onClick={() => { closeModal('batch-flag'); showToast('Batch flagged. Investigation record created and officer notified.'); }}>Flag for Investigation</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('convert-deployment')} onClose={close('convert-deployment')} title="Convert to Full Deployment" width={460}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Your pilot fee of <CurrencyAmount nairaAmount={3500000} /> is credited in full against the ₦4,500,000 onboarding fee — effective cost <CurrencyAmount nairaAmount={1000000} />.
        </div>
        <FormGroup label="Notes for account manager (optional)">
          <textarea className="inp" rows={2} placeholder="Any questions or requirements..." style={{ resize: 'vertical' }} />
        </FormGroup>
        <ModalFooter>
          <Button variant="secondary" onClick={close('convert-deployment')}>Cancel</Button>
          <Button onClick={() => { closeModal('convert-deployment'); showToast('Conversion request submitted. Your account manager will contact you within 2 business days.'); }}>Request Conversion</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('domain-upgrade')} onClose={close('domain-upgrade')} title="Request Domain Upgrade" width={440}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Domain upgrades are provisioned by Sartor. Your account manager will contact you within 2 business days.
        </div>
        <FormGroup label="Preferred Domain Type">
          <select className="inp">
            <option>Growth Subdomain (verify-{'{code}'}.sartor.ng) — ₦100,000 one-time</option>
            <option>Enterprise CNAME (your own domain) — ₦150,000 setup + ₦200,000/yr</option>
          </select>
        </FormGroup>
        <FormGroup label="Preferred Subdomain / Domain Name">
          <input className="inp" placeholder="e.g. verify-health or verify.yourdomain.com" />
        </FormGroup>
        <FormGroup label="Additional Notes">
          <textarea className="inp" rows={2} placeholder="Any specific requirements..." style={{ resize: 'vertical' }} />
        </FormGroup>
        <ModalFooter>
          <Button variant="secondary" onClick={close('domain-upgrade')}>Cancel</Button>
          <Button onClick={() => { closeModal('domain-upgrade'); showToast('Domain upgrade request submitted. Your account manager will be in touch within 2 business days.'); }}>Submit Request</Button>
        </ModalFooter>
      </Modal>

      <CampaignWizardModal
        open={isOpen('create-campaign')}
        products={products}
        onClose={close('create-campaign')}
        onSubmit={async (payload) => {
          try {
            await giftsApi.createCampaign(payload);
            await refreshCampaigns();
            showToast(
              payload.status === 'ACTIVE'
                ? 'Campaign activated! Consumers will begin accumulating progress immediately.'
                : 'Saved as Draft.',
            );
          } catch (e) {
            showToast(e instanceof Error ? e.message : 'Failed to save campaign');
            throw e;
          }
        }}
      />

      <Modal open={isOpen('pause-warn')} onClose={close('pause-warn')} title="Pause Campaign?" width={440}>
        <div style={{ padding: 12, background: 'var(--ab)', borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--at)', marginBottom: 6 }}>⚠ Auth counts will freeze</div>
          <div style={{ fontSize: 13, color: 'var(--at)' }}>
            Consumers will not accumulate progress toward milestones during the pause period.
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Pause <strong>Welcome & Loyalty — Default</strong>?
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={close('pause-warn')}>Cancel</Button>
          <Button variant="amber" onClick={() => { closeModal('pause-warn'); showToast('Campaign paused. Auth counts frozen.'); }}>Pause Campaign</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('end-warn')} onClose={close('end-warn')} title="End Campaign?" width={440}>
        <div style={{ padding: 12, background: 'var(--rb)', borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--rt)', marginBottom: 6 }}>⚠ This action is permanent</div>
          <div style={{ fontSize: 13, color: 'var(--rt)' }}>
            All remaining PENDING_STOCK events (25 consumers) will be automatically VOIDED.
          </div>
        </div>
        <FormGroup label="Type END to confirm">
          <input className="inp" placeholder="Type END to confirm" />
        </FormGroup>
        <ModalFooter>
          <Button variant="secondary" onClick={close('end-warn')}>Cancel</Button>
          <Button variant="danger" onClick={() => { closeModal('end-warn'); showToast('Campaign ended. PENDING_STOCK events voided.'); }}>End Campaign Permanently</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('replenish')} onClose={close('replenish')} title="Replenish Gift Stock" width={420} subtitle="Pool 3 — Premium Membership">
        <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
          <div><div style={{ color: 'var(--text3)' }}>Current stock</div><div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", color: 'var(--at)' }}>4</div></div>
          <div><div style={{ color: 'var(--text3)' }}>Waitlisted</div><div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>0</div></div>
          <div><div style={{ color: 'var(--text3)' }}>Total issued</div><div style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>56</div></div>
        </div>
        <FormGroup label="Add Quantity *">
          <input type="number" className="inp" placeholder="How many units to add?" />
        </FormGroup>
        <FormGroup label="Replenishment Notes (optional)">
          <input className="inp" placeholder="e.g. Batch 3 stock received from supplier" />
        </FormGroup>
        <div className="twrap" style={{ padding: '10px 0', borderTop: '1px solid var(--bg2)', marginTop: 4 }}>
          <div>
            <div className="tlbl">Release to PENDING_STOCK waitlist</div>
            <div className="tdesc">Assign gifts to waiting consumers in chronological order</div>
          </div>
          <Toggle defaultOn />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={close('replenish')}>Cancel</Button>
          <Button onClick={() => { closeModal('replenish'); showToast('Stock replenished. Gifts assigned to waitlist consumers.'); }}>Replenish Stock</Button>
        </ModalFooter>
      </Modal>

      <Modal open={isOpen('add-gift')} onClose={close('add-gift')} title="Add Gift to Pool" width={460} subtitle="Multiple gifts in one pool = weighted random selection">
        <FormGroup label="Gift Name *">
          <input className="inp" placeholder="e.g. ₦500 Store Credit, Free T-Shirt" />
        </FormGroup>
        <FormGroup label="Gift Description">
          <input className="inp" placeholder="Brief description for consumer-facing screens" />
        </FormGroup>
        <div className="fg">
          <label className="fi">Gift Image</label>
          <div className="imgzone">
            <div className="ic">🖼</div>
            <p>Upload gift image</p>
            <small>PNG, JPG · Max 5MB</small>
          </div>
        </div>
        <div className="fr2">
          <FormGroup label="Total Quantity *">
            <input type="number" className="inp" placeholder="Total stock available" />
          </FormGroup>
          <FormGroup label="Probability Weight">
            <input type="number" className="inp" placeholder="1.0" defaultValue={1.0} />
          </FormGroup>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={close('add-gift')}>Cancel</Button>
          <Button onClick={() => { closeModal('add-gift'); showToast('Gift added to pool.'); }}>Add Gift</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function CurrencyModal({
  open,
  onClose,
  current,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  current: CurrencyCode;
  onSelect: (c: CurrencyCode) => void;
}) {
  const codes = Object.keys(CURRENCIES) as CurrencyCode[];
  return (
    <Modal open={open} onClose={onClose} title="Change Display Currency" width={400}>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Exchange rates updated daily.</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {codes.map((code) => (
          <button
            key={code}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 9,
              border: `1px solid ${current === code ? 'var(--navy)' : 'var(--border)'}`,
              borderRadius: 7,
              cursor: 'pointer',
              background: current === code ? 'var(--bb)' : '#fff',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onClick={() => onSelect(code)}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{CURRENCIES[code].label}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function EditMemberModal({
  open,
  onClose,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warn') => void;
}) {
  const [suspended, setSuspended] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Edit Team Member" width={460}>
      <FormGroup label="Full Name">
        <input className="inp" defaultValue="Sarah Adeyemi" />
      </FormGroup>
      <FormGroup label="Email Address">
        <input className="inp" defaultValue="sarah@sartorhealth.com" readOnly />
      </FormGroup>
      <FormGroup label="Role">
        <select className="inp">
          <option>Batch Admin</option>
          <option>Brand Manager</option>
          <option>Investigation Officer</option>
        </select>
      </FormGroup>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 6 }}>
        <div className="twrap" style={{ padding: '8px 0' }}>
          <div>
            <div className="tlbl" style={{ fontSize: 12 }}>Account Status</div>
            <div className="tdesc">Member can currently log in and use the platform</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant={suspended ? 'br' : 'bg'}>{suspended ? 'Suspended' : 'Active'}</Badge>
            <Button
              variant={suspended ? 'success' : 'danger'}
              size="sm"
              onClick={() => {
                setSuspended(!suspended);
                showToast(suspended ? 'Team member access reinstated.' : 'Team member access suspended.', suspended ? 'success' : 'warn');
              }}
            >
              {suspended ? 'Reinstate Access' : 'Suspend Access'}
            </Button>
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onClose(); showToast('Team member updated successfully.'); }}>Save Changes</Button>
      </ModalFooter>
    </Modal>
  );
}

function ReportsModal({
  open,
  onClose,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Generate Report" width={480}>
      <FormGroup label="Report Type *">
        <select className="inp">
          <option value="">Select report type...</option>
          <option value="auth">Authentication Summary — scan volume, auth rate, outcomes</option>
          <option value="batch">Batch Performance — per-batch scan rates, delivery, DORA status</option>
          <option value="fraud">Fraud & Investigation Report</option>
          <option value="loyalty">Loyalty & Redemptions Report</option>
          <option value="credits">Credit Usage Report</option>
          <option value="geo">Geographic Distribution Report</option>
        </select>
      </FormGroup>
      <div className="fr2">
        <FormGroup label="Date From *">
          <input type="date" className="inp" />
        </FormGroup>
        <FormGroup label="Date To *">
          <input type="date" className="inp" />
        </FormGroup>
      </div>
      <FormGroup label="Product Filter">
        <select className="inp">
          <option>All Products</option>
          <option>Sartor Hand Sanitiser 500ml (SHS-001)</option>
          <option>Carabiner Holder Pack (CHP-002)</option>
        </select>
      </FormGroup>
      <FormGroup label="Format">
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '2px solid var(--navy)', borderRadius: 7, background: 'var(--bb)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--bt)' }}>
            <input type="radio" name="mfmt" defaultChecked style={{ margin: 0 }} /> CSV
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>
            <input type="radio" name="mfmt" style={{ margin: 0 }} /> PDF
          </label>
        </div>
      </FormGroup>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onClose(); showToast('Report generated and downloading now.'); }}>Generate & Download</Button>
      </ModalFooter>
    </Modal>
  );
}
