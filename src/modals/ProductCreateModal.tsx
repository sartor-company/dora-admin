import { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useModal, type ProductModalPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';

interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductCreateModal({ open, onClose, onSuccess }: ProductCreateModalProps) {
  const { refreshProducts } = useTenantData();
  const { getPayload } = useModal();
  const editPayload = getPayload<ProductModalPayload>('product');
  const isEdit = editPayload?.mode === 'edit';
  const editId = isEdit ? editPayload.product._id : '';

  const [productName, setProductName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (isEdit && editPayload?.product) {
      const p = editPayload.product;
      setProductName(p.productName || '');
      setManufacturer(p.manufacturer || '');
      setBarcodeNumber(p.barcodeNumber || '');
      setDescription(p.description || '');
    } else {
      setProductName('');
      setManufacturer('');
      setBarcodeNumber('');
      setDescription('');
    }
    setError('');
  }, [open, isEdit, editPayload]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      setError('Product name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        productName: productName.trim(),
        manufacturer: manufacturer.trim() || undefined,
        barcodeNumber: barcodeNumber.trim() || undefined,
        description: description.trim() || undefined,
      };
      if (isEdit && editId) {
        await productsApi.update(editId, body);
      } else {
        await productsApi.create(body);
      }
      await refreshProducts();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      subtitle={isEdit ? 'Update product details' : 'Create a new SartorChain product'}
      width={480}
    >
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <FormGroup label="Product Name *">
        <input
          className="inp"
          placeholder="Full product name as printed on label"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </FormGroup>
      <FormGroup label="Manufacturer">
        <input
          className="inp"
          placeholder="Manufacturer name"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
      </FormGroup>
      <FormGroup label="Barcode (optional)">
        <input
          className="inp"
          placeholder="EAN-13 or other barcode"
          value={barcodeNumber}
          onChange={(e) => setBarcodeNumber(e.target.value)}
        />
      </FormGroup>
      <FormGroup label="Description">
        <input
          className="inp"
          placeholder="Short product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormGroup>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
