import { CURRENCIES } from '../constants/currency';
import { useApp } from '../context/AppContext';
import { useTenantData } from '../context/TenantDataContext';
import { giftsApi } from '../api/gifts';
import { authApi } from '../api/auth';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { CurrencyCode } from '../types';
import { BatchCreateModal } from './BatchCreateModal';
import { BuyCreditsModal } from './BuyCreditsModal';
import { CampaignWizardModal } from './CampaignWizardModal';
import { CampaignEndModal, CampaignPauseModal } from './CampaignActionModals';
import { DoraUploadModal } from './DoraUploadModal';
import { InviteMemberModal } from './InviteMemberModal';
import { ProductCreateModal } from './ProductCreateModal';
import { FlagBatchModal } from './FlagBatchModal';
import { ReplenishGiftModal } from './ReplenishGiftModal';
import { AddGiftModal } from './AddGiftModal';
import { EditMemberModal } from './EditMemberModal';
import { BatchDownloadModal, BatchPauseModal } from './BatchActionModals';
import { ClearFalsePositiveModal, EvidenceBundleModal } from './InvestigationActionModals';
import { ReportsModal } from './ReportsModal';
import type { BatchActionPayload, EditMemberPayload, ActivateStickerBatchPayload, PaymentGatewayPayload, StickerTrackPayload } from '../context/ModalContext';
import { PlaceStickerOrderModal } from './PlaceStickerOrderModal';
import { ActivateStickerBatchModal } from './ActivateStickerBatchModal';
import { DomainUpgradeModal } from './DomainUpgradeModal';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { InvoiceViewModal } from './InvoiceViewModal';
import { AddSkuLicencesModal } from './AddSkuLicencesModal';
import { StickerTrackModal } from './StickerTrackModal';
import type { InvoiceViewPayload } from '../context/ModalContext';

export function ModalsRoot() {
  const { isOpen, closeModal, getPayload } = useModal();
  const { currency, setCurrency } = useApp();
  const { doraUploadTarget, refreshBatches, products, refreshCampaigns, refreshInvoices, notifyGiftChange } = useTenantData();
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

      <EditMemberModal
        open={isOpen('edit-member')}
        member={getPayload<EditMemberPayload>('edit-member')?.member}
        onClose={close('edit-member')}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <BuyCreditsModal
        open={isOpen('buy-credits')}
        onClose={close('buy-credits')}
        onSuccess={async () => {
          await refreshInvoices();
        }}
      />

      <FlagBatchModal
        onSuccess={() => showToast('Investigation opened for this batch.', 'success')}
      />

      <ReplenishGiftModal
        onSuccess={() => {
          notifyGiftChange();
          showToast('Stock replenished.', 'success');
        }}
      />

      <AddGiftModal
        onSuccess={() => {
          notifyGiftChange();
          showToast('Gift added to pool.', 'success');
        }}
      />

      <ReportsModal open={isOpen('reports')} onClose={close('reports')} showToast={showToast} />

      <ClearFalsePositiveModal onSuccess={(msg) => showToast(msg, 'success')} />
      <EvidenceBundleModal onSuccess={(msg) => showToast(msg, 'success')} />

      <BatchDownloadModal
        open={isOpen('batch-download')}
        batch={getPayload<BatchActionPayload>('batch-download')}
        onClose={close('batch-download')}
      />

      <BatchPauseModal
        open={isOpen('batch-pause')}
        batch={getPayload<BatchActionPayload>('batch-pause')}
        onClose={close('batch-pause')}
      />

      <ConvertDeploymentModal
        open={isOpen('convert-deployment')}
        onClose={close('convert-deployment')}
        onProceed={async () => {
          try {
            await authApi.submitRequest({
              type: 'pilot_conversion',
              notes: 'Pilot to Full Deployment conversion requested from owner dashboard',
            });
            closeModal('convert-deployment');
            showToast(
              'Conversion request submitted. Sartor will invoice ₦1,000,000 (after pilot credit) within 1 business day.',
              'success',
            );
          } catch (e) {
            showToast(e instanceof Error ? e.message : 'Could not submit conversion request.', 'error');
          }
        }}
      />

      <DomainUpgradeModal open={isOpen('domain-upgrade')} onClose={close('domain-upgrade')} />

      <PlaceStickerOrderModal open={isOpen('place-sticker-order')} onClose={close('place-sticker-order')} />

      <ActivateStickerBatchModal
        open={isOpen('activate-sticker-batch')}
        order={getPayload<ActivateStickerBatchPayload>('activate-sticker-batch')}
        onClose={close('activate-sticker-batch')}
      />

      <PaymentGatewayModal
        open={isOpen('payment-gateway')}
        payload={getPayload<PaymentGatewayPayload>('payment-gateway')}
        onClose={close('payment-gateway')}
      />

      <InvoiceViewModal
        open={isOpen('invoice-view')}
        invoice={getPayload<InvoiceViewPayload>('invoice-view')}
        onClose={close('invoice-view')}
      />

      <AddSkuLicencesModal open={isOpen('add-sku-licences')} onClose={close('add-sku-licences')} />

      <StickerTrackModal
        open={isOpen('sticker-track')}
        payload={getPayload<StickerTrackPayload>('sticker-track')}
        onClose={close('sticker-track')}
      />

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

      <CampaignPauseModal
        onPauseSuccess={() => showToast('Campaign paused. Auth counts frozen.', 'success')}
      />
      <CampaignEndModal onEndSuccess={() => showToast('Campaign ended. PENDING_STOCK events voided.', 'success')} />

    </>
  );
}

function ConvertDeploymentModal({
  open,
  onClose,
  onProceed,
}: {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Convert to Full Deployment" width={460}>
      <div style={{ padding: 12, background: 'var(--gb)', borderRadius: 8, marginBottom: 14, fontSize: 12, color: 'var(--gt)' }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>✓ Your data and progress carry forward in full</div>
        All DORA models, consumer scan history, loyalty points, and gift campaigns created during your pilot will remain
        active under Full Deployment. Nothing is lost.
      </div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 14, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 9, background: 'var(--bg)', borderRadius: 6 }}>
          <span>Pilot fee paid (credit)</span>
          <strong>
            <CurrencyAmount nairaAmount={3500000} />
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 9, background: 'var(--bg)', borderRadius: 6 }}>
          <span>Onboarding fee</span>
          <strong>
            <CurrencyAmount nairaAmount={4500000} />
          </strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 9,
            background: 'var(--gb)',
            borderRadius: 6,
            fontWeight: 700,
            color: 'var(--gt)',
          }}
        >
          <span>Effective cost to convert</span>
          <strong>
            <CurrencyAmount nairaAmount={1000000} />
          </strong>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
        By confirming, you authorise Sartor Limited to invoice your organisation for ₦1,000,000 and transition your
        account to Full Deployment within 1 business day.
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Not yet
        </Button>
        <Button style={{ background: '#D64000' }} onClick={onProceed}>
          Proceed to Payment →
        </Button>
      </ModalFooter>
    </Modal>
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
