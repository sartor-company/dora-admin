import { useEffect, useMemo, useState } from 'react';
import { labelsApi } from '../api/labels';
import { stickersApi, type LinkableBatch } from '../api/stickers';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { ImageUploadZone } from '../components/wizards/ImageUploadZone';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { ActivateStickerBatchPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';

interface Props {
  open: boolean;
  order?: ActivateStickerBatchPayload;
  onClose: () => void;
}

export function ActivateStickerBatchModal({ open, order, onClose }: Props) {
  const { refreshStickerOrders, refreshBatches, refreshAccount } = useTenantData();
  const { showToast } = useToast();
  const [batches, setBatches] = useState<LinkableBatch[]>([]);
  const [unlinkedPins, setUnlinkedPins] = useState(0);
  const [hint, setHint] = useState('');
  const [orderProductName, setOrderProductName] = useState(order?.product || 'Product');
  const [batchId, setBatchId] = useState('');
  const [units, setUnits] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    batchNumber: string;
    linkedCount: number;
    remaining: number;
  } | null>(null);

  const ref = order?.ref || 'STK-0001';
  const product = order?.product || 'Product';
  const printed = order?.printed ?? 0;
  const planned = order?.planned ?? 0;
  const productId = order?.productId;

  const selected = batches.find((b) => b._id === batchId);
  const maxLinkable = selected
    ? Math.min(selected.freeSlots, unlinkedPins || selected.maxLinkable)
    : 0;
  const applied = parseInt(units, 10) || 0;

  const canSubmit = useMemo(() => {
    if (!batchId || !selected) return false;
    if (unlinkedPins <= 0) return false;
    if (!applied || applied < 1 || applied > maxLinkable) return false;
    return true;
  }, [batchId, selected, applied, maxLinkable, unlinkedPins]);

  const loadBatches = async () => {
    if (!order?.id) return;
    setLoadingBatches(true);
    try {
      const data = await stickersApi.linkableBatches(order.id);
      setBatches(data.batches);
      setUnlinkedPins(data.unlinkedPins);
      setHint(data.hint || '');
      setOrderProductName(data.productName || order.product || 'Product');
      if (data.batches.length === 1) {
        setBatchId(data.batches[0]._id);
        setUnits(String(data.batches[0].maxLinkable));
      } else if (!data.batches.some((b) => b._id === batchId)) {
        setBatchId('');
        setUnits('');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load batches.', 'error');
      setBatches([]);
      setUnlinkedPins(0);
      setHint('');
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    if (open && order?.id) {
      setLastResult(null);
      setFrontImage(null);
      setBackImage(null);
      setHint('');
      setOrderProductName(order.product || 'Product');
      void loadBatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order?.id]);

  useEffect(() => {
    if (!selected) return;
    const cap = Math.min(selected.freeSlots, unlinkedPins || selected.maxLinkable);
    setUnits(String(cap));
  }, [batchId, selected, unlinkedPins]);

  const handleClose = () => {
    setBatches([]);
    setBatchId('');
    setUnits('');
    setUnlinkedPins(0);
    setFrontImage(null);
    setBackImage(null);
    setLastResult(null);
    onClose();
  };

  const handleLink = async () => {
    if (!order?.id || !canSubmit) {
      showToast('Select a batch and units to link.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const result = await stickersApi.link(order.id, {
        batchId,
        quantity: applied,
      });

      if (frontImage && productId) {
        try {
          await labelsApi.upload(productId, result.batchId, frontImage, backImage || frontImage);
        } catch (uploadErr) {
          showToast(
            uploadErr instanceof Error
              ? `PINs linked, but DORA upload failed: ${uploadErr.message}`
              : 'PINs linked, but DORA upload failed.',
            'warn',
          );
        }
      }

      await Promise.all([refreshStickerOrders(), refreshBatches(), refreshAccount()]);

      if (result.canLinkMore) {
        setLastResult({
          batchNumber: result.batchNumber,
          linkedCount: result.linkedCount,
          remaining: result.unlinkedPinsRemaining,
        });
        setFrontImage(null);
        setBackImage(null);
        await loadBatches();
        showToast(
          `Linked ${result.linkedCount.toLocaleString()} PINs to ${result.batchNumber}. ${result.unlinkedPinsRemaining.toLocaleString()} PINs left — add another batch.`,
          'success',
        );
      } else {
        handleClose();
        showToast(
          `${ref} fully linked. ${result.linkedCount.toLocaleString()} PINs assigned to ${result.batchNumber}.`,
          'success',
        );
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not link PINs to batch.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefundRemaining = async () => {
    if (!order?.id) return;
    setSubmitting(true);
    try {
      const result = await stickersApi.refundUnlinked(order.id);
      await Promise.all([refreshStickerOrders(), refreshAccount()]);
      handleClose();
      showToast(
        `${result.pinCreditsReturned.toLocaleString()} unused PIN credits returned.`,
        'success',
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not refund unused PINs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Link PINs to Batch — ${ref}`}
      width={560}
      subtitle={`${product} · ${printed.toLocaleString()} stickers (${planned.toLocaleString()} planned + 10% overage)`}
    >
      <div
        style={{
          padding: '9px 12px',
          background: 'var(--gb)',
          borderRadius: 7,
          fontSize: 12,
          color: 'var(--gt)',
          marginBottom: 14,
          lineHeight: 1.55,
        }}
      >
        Select an existing batch. Unlinked PINs are assigned 1:1 to free serial numbers (FIFO). If this
        order has more PINs than the batch has free slots, link what fits, then add another batch for the
        rest.
      </div>

      {lastResult && (
        <div
          style={{
            padding: '9px 12px',
            background: 'var(--bb)',
            borderRadius: 7,
            fontSize: 12,
            color: 'var(--bt)',
            marginBottom: 14,
          }}
        >
          ✓ Linked {lastResult.linkedCount.toLocaleString()} to <strong>{lastResult.batchNumber}</strong>.{' '}
          {lastResult.remaining.toLocaleString()} PINs still unlinked — choose another batch below, or
          return unused credits.
        </div>
      )}

      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 13,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 10,
          }}
        >
          Link to existing batch
        </div>

        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
          Product:{' '}
          <strong>{orderProductName}</strong>
          {' · '}
          Unlinked PINs:{' '}
          <strong style={{ fontFamily: "'DM Mono', monospace" }}>
            {loadingBatches ? '…' : unlinkedPins.toLocaleString()}
          </strong>
        </div>

        {!loadingBatches && batches.length === 0 && hint && (
          <div
            style={{
              padding: '9px 12px',
              background: 'var(--yb)',
              border: '1px solid var(--y)',
              borderRadius: 7,
              fontSize: 12,
              color: 'var(--yt)',
              marginBottom: 10,
            }}
          >
            {hint}
          </div>
        )}

        <FormGroup label="Batch *">
          <select
            className="inp"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            disabled={loadingBatches || batches.length === 0}
          >
            <option value="">
              {loadingBatches
                ? 'Loading batches…'
                : batches.length === 0
                  ? 'No matching batches with free SN slots'
                  : 'Select a batch…'}
            </option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchNumber} · {b.freeSlots.toLocaleString()} / {b.quantity.toLocaleString()} slots free
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup
          label="PINs to link *"
          hint={
            selected
              ? `Max ${maxLinkable.toLocaleString()} (min of free slots and unlinked PINs)`
              : 'Select a batch first'
          }
        >
          <input
            className="inp"
            type="number"
            min={1}
            max={maxLinkable || undefined}
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            disabled={!selected}
          />
        </FormGroup>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          DORA reference images <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(optional)</span>
        </div>
        <div className="fr2">
          <ImageUploadZone label="Front" file={frontImage} onFileChange={setFrontImage} />
          <ImageUploadZone label="Back" file={backImage} onFileChange={setBackImage} />
        </div>
      </div>

      <ModalFooter>
        {unlinkedPins > 0 && lastResult && (
          <Button variant="secondary" onClick={handleRefundRemaining} disabled={submitting}>
            Return unused credits
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          {lastResult && unlinkedPins > 0 ? 'Finish later' : 'Cancel'}
        </Button>
        <Button onClick={handleLink} disabled={!canSubmit || submitting}>
          {submitting
            ? 'Linking…'
            : lastResult
              ? 'Add another batch →'
              : 'Link PINs →'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
