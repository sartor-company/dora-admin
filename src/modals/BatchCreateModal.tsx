import { useState } from 'react';
import { batchesApi } from '../api/batches';
import { suppliersApi } from '../api/suppliers';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useTenantData } from '../context/TenantDataContext';
import { useAuthStore } from '../store/authStore';

interface BatchCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchCreateModal({ open, onClose, onSuccess }: BatchCreateModalProps) {
  const { products, refreshBatches } = useTenantData();
  const user = useAuthStore((s) => s.user);
  const [productId, setProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setProductId('');
    setBatchNumber('');
    setQuantity('');
    setExpiryDate('');
    setManufacturer('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!productId || !batchNumber.trim() || !quantity || !expiryDate) {
      setError('Product, batch number, quantity, and expiry date are required.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (!user?.email) {
      setError('Account email missing — sign in again.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const supplier = await suppliersApi.ensureDefault(user.email, user.fullName);
      const selected = products.find((p) => p._id === productId);
      const mfr = manufacturer.trim() || selected?.manufacturer || user.fullName || 'Manufacturer';
      const expiryTs = new Date(expiryDate).getTime();

      await batchesApi.create({
        manufacturer: mfr,
        product: productId,
        invoiceNumber: `INV-${Date.now()}`,
        supplier: supplier._id,
        batch: [
          {
            quantity: qty,
            batchNumber: batchNumber.trim(),
            expiryDate: expiryTs,
          },
        ],
      });
      await refreshBatches();
      reset();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create batch.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create Batch" subtitle="Generate authenticated product batch" width={480}>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <FormGroup label="Product *">
        <select className="inp" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Select product…</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.productName}
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup label="Batch Number *">
        <input
          className="inp"
          placeholder="e.g. BATCH-2026-Q2-001"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
        />
      </FormGroup>
      <div className="fr2">
        <FormGroup label="Quantity *">
          <input
            type="number"
            className="inp"
            min={1}
            placeholder="Units in batch"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Expiry Date *">
          <input type="date" className="inp" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </FormGroup>
      </div>
      <FormGroup label="Manufacturer">
        <input
          className="inp"
          placeholder="Defaults to product manufacturer"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
      </FormGroup>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || products.length === 0}>
          {saving ? 'Creating…' : 'Create Batch'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
