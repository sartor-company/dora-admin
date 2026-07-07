import { useEffect, useMemo, useState } from 'react';
import { productsApi, type ProductImageSlot } from '../api/products';
import { StepWizardModal, type StepDef } from '../components/wizards/StepWizardModal';
import { ChoiceCard } from '../components/wizards/ChoiceCard';
import { ImageUploadZone } from '../components/wizards/ImageUploadZone';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { DORASCAN_VERIFY_BASE } from '../constants/dorascan';
import { useModal, type ProductModalPayload } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';

interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type BarcodeMode = 'have' | 'create';
type LabelConfig = '2sided' | '1sided' | '6sided';

const DORA_CATEGORIES = [
  { value: 'LIQUID_FORMULATION', label: 'Liquid Formulation — bottles, sprays, gels (F1–F9 + P1–P5)' },
  { value: 'LABEL_ONLY', label: 'Label Only — sachets, blister packs, flat labels' },
  { value: 'BOX_6SIDED', label: '6-Sided Box — cartons, folding boxes' },
  { value: 'PHYSICAL_ACCESSORY', label: 'Physical Accessory — devices, kits, equipment' },
];

const PRODUCT_CATEGORIES = ['Personal Care', 'Accessories', 'FMCG', 'Pharmaceutical'];

function barcodeStatusText(value: string): string {
  const digits = value.replace(/\D/g, '');
  if ([8, 12, 13, 14].includes(digits.length)) {
    const type = digits.length === 8 ? 'EAN-8' : digits.length === 12 ? 'UPC-A' : digits.length === 13 ? 'EAN-13' : 'GTIN-14';
    return `✓ GS1 barcode detected (${type}) — GS1 Verified badge will be applied.`;
  }
  if (/^[0-9]+$/.test(value) && value.length > 4) return 'Numeric code detected — stored as manufacturer barcode.';
  if (/^[A-Z0-9\-.$/+%\s]+$/i.test(value)) return 'Alphanumeric code detected (Code 39 compatible).';
  return "Enter your barcode above. We'll detect the format automatically.";
}

export function ProductCreateModal({ open, onClose, onSuccess }: ProductCreateModalProps) {
  const { refreshProducts } = useTenantData();
  const { getPayload } = useModal();
  const editPayload = getPayload<ProductModalPayload>('product');
  const isEdit = editPayload?.mode === 'edit';
  const editId = isEdit ? editPayload.product._id : '';

  const [productName, setProductName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [doraCategory, setDoraCategory] = useState('');
  const [barcodeMode, setBarcodeMode] = useState<BarcodeMode>('have');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [sizeVolume, setSizeVolume] = useState('');
  const [skuLabelName, setSkuLabelName] = useState('');
  const [description, setDescription] = useState('');
  const [labelConfig, setLabelConfig] = useState<LabelConfig>('2sided');
  const [licenceCount, setLicenceCount] = useState(1);
  const [imageFiles, setImageFiles] = useState<Partial<Record<ProductImageSlot, File | null>>>({});
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
      setProductCategory('');
      setDoraCategory('');
      setBarcodeMode('have');
      setBarcodeNumber('');
      setSizeVolume('');
      setSkuLabelName('');
      setDescription('');
      setLabelConfig('2sided');
      setLicenceCount(1);
      setImageFiles({});
    }
    setError('');
  }, [open, isEdit, editPayload]);

  const handleClose = () => onClose();

  const setImageFile = (slot: ProductImageSlot, file: File | null) => {
    setImageFiles((prev) => ({ ...prev, [slot]: file }));
  };

  const validateReferenceImages = (): string | null => {
    if (labelConfig === '1sided') {
      if (!imageFiles.front) return 'Front label image is required.';
      return null;
    }
    if (labelConfig === '2sided') {
      if (!imageFiles.front) return 'Front image is required.';
      if (!imageFiles.back) return 'Back image is required.';
      return null;
    }
    if (!imageFiles.front) return 'Front image is required for multi-sided labels.';
    return null;
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      setError('Product name is required.');
      throw new Error('validation');
    }
    if (!isEdit && !manufacturer.trim()) {
      setError('Manufacturer is required.');
      throw new Error('validation');
    }
    if (!isEdit && barcodeMode === 'have' && !barcodeNumber.trim()) {
      setError('Enter your barcode or choose auto-generate.');
      throw new Error('validation');
    }
    if (!isEdit) {
      const imageError = validateReferenceImages();
      if (imageError) {
        setError(imageError);
        throw new Error('validation');
      }
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        productName: productName.trim(),
        manufacturer: manufacturer.trim() || undefined,
        barcodeNumber: barcodeMode === 'create' ? undefined : barcodeNumber.trim() || undefined,
        description: description.trim() || undefined,
        productCategory: productCategory || undefined,
        doraCategory: doraCategory || undefined,
        sizeVolume: sizeVolume.trim() || undefined,
        skuLabelName: skuLabelName.trim() || undefined,
        labelConfig: !isEdit ? labelConfig : undefined,
      };
      if (isEdit && editId) {
        await productsApi.update(editId, body);
        const hasImages = Object.values(imageFiles).some(Boolean);
        if (hasImages) {
          const cfg = (editPayload?.product?.labelConfig as LabelConfig | undefined) || labelConfig;
          await productsApi.uploadReferenceImages(editId, imageFiles, cfg);
        }
      } else {
        const created = await productsApi.create(body);
        await productsApi.uploadReferenceImages(created._id, imageFiles, labelConfig);
      }
      await refreshProducts();
      onSuccess();
    } catch (e) {
      if (e instanceof Error && e.message === 'validation') throw e;
      setError(e instanceof Error ? e.message : 'Could not save product.');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const wizardSteps = useMemo((): StepDef[] => {
    const imageZones =
      labelConfig === '1sided' ? (
        <ImageUploadZone
          label="Label Image"
          required
          hint="PNG, JPG · Max 20MB"
          file={imageFiles.front}
          onFileChange={(f) => setImageFile('front', f)}
        />
      ) : labelConfig === '6sided' ? (
        <>
          {(
            [
              ['top', 'Top Image'],
              ['front', 'Front Image *'],
              ['right', 'Right Image'],
              ['back', 'Back Image'],
              ['left', 'Left Image'],
              ['bottom', 'Bottom Image'],
            ] as [ProductImageSlot, string][]
          ).map(([slot, lbl]) => (
            <ImageUploadZone
              key={slot}
              label={lbl}
              required={slot === 'front'}
              file={imageFiles[slot]}
              onFileChange={(f) => setImageFile(slot, f)}
            />
          ))}
        </>
      ) : (
        <>
          <ImageUploadZone
            label="Front Image"
            required
            hint="PNG, JPG, TIFF · Max 20MB · Full label visible"
            file={imageFiles.front}
            onFileChange={(f) => setImageFile('front', f)}
          />
          <ImageUploadZone
            label="Back Image"
            required
            hint="PNG, JPG, TIFF · Max 20MB"
            file={imageFiles.back}
            onFileChange={(f) => setImageFile('back', f)}
          />
        </>
      );

    return [
      {
        title: 'Basic Info',
        subtitle: 'Step 1 of 4',
        content: (
          <>
            <FormGroup label="Product Name *">
              <input
                className="inp"
                placeholder="Full product name as printed on label"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Manufacturer *">
              <input
                className="inp"
                placeholder="Search or add manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Product Category *">
              <select className="inp" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                <option value="">Select...</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="DORA AI Product Category *" hint="Determines which DORA AI features activate at consumer scan time.">
              <select className="inp" value={doraCategory} onChange={(e) => setDoraCategory(e.target.value)}>
                <option value="">Select DORA category...</option>
                {DORA_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FormGroup>
          </>
        ),
      },
      {
        title: 'Barcode & Specifications',
        subtitle: 'Step 2 of 4',
        content: (
          <>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
              Every product on Sartor-Chain has a unique Sartor Authentication Code. Tell us whether you already have a
              barcode printed on your product.
            </div>
            <FormGroup label="Barcode Status *">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ChoiceCard
                  selected={barcodeMode === 'have'}
                  title="🛒 I have a barcode"
                  description="Enter your existing GS1 or manufacturer barcode."
                  onClick={() => setBarcodeMode('have')}
                />
                <ChoiceCard
                  selected={barcodeMode === 'create'}
                  title="✨ Create a barcode for me"
                  description="We'll generate a Sartor Authentication Code — Code 128."
                  onClick={() => setBarcodeMode('create')}
                />
              </div>
            </FormGroup>
            {barcodeMode === 'have' ? (
              <FormGroup label="Your Barcode *">
                <input
                  className="inp"
                  placeholder="Enter barcode exactly as it appears on the label"
                  value={barcodeNumber}
                  onChange={(e) => setBarcodeNumber(e.target.value)}
                />
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 5,
                    color: barcodeNumber ? 'var(--gt)' : 'var(--text3)',
                    fontWeight: barcodeNumber ? 600 : 400,
                  }}
                >
                  {barcodeNumber ? barcodeStatusText(barcodeNumber) : barcodeStatusText('')}
                </div>
              </FormGroup>
            ) : (
              <div style={{ padding: '10px 12px', background: 'var(--gb)', borderRadius: 8, marginBottom: 13 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gt)', marginBottom: 4 }}>
                  ✓ Sartor Authentication Code will be auto-generated
                </div>
                <div style={{ fontSize: 11, color: 'var(--gt)' }}>
                  Format: SC-HPC-SHC-00001 · Encoded as Code 128 · Included in your batch output ZIP
                </div>
              </div>
            )}
            <div className="fr2">
              <FormGroup label="Size / Volume" hint="Enables DORA size check (F6)">
                <input className="inp" placeholder="e.g. 500ml, 250g" value={sizeVolume} onChange={(e) => setSizeVolume(e.target.value)} />
              </FormGroup>
              <FormGroup label="SKU Name (as printed on label)" hint="Enables DORA SKU name OCR check (F5)">
                <input className="inp" placeholder="Exact name on label" value={skuLabelName} onChange={(e) => setSkuLabelName(e.target.value)} />
              </FormGroup>
            </div>
          </>
        ),
      },
      {
        title: 'Regulatory Licences',
        subtitle: 'Step 3 of 4',
        content: (
          <>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 11 }}>
              Optional — enables regulatory semantic check (F9). Each product can hold multiple licence numbers.
            </div>
            {Array.from({ length: licenceCount }, (_, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>Licence {i + 1}</div>
                <div className="fr2">
                  <FormGroup label="Authority">
                    <select className="inp">
                      <option>Select</option>
                      <option>NAFDAC (Nigeria)</option>
                      <option>SON — Standards Organisation of Nigeria</option>
                      <option>PCN — Pharmacists Council of Nigeria</option>
                      <option>FDA (USA)</option>
                      <option>MHRA (UK)</option>
                      <option>Other</option>
                    </select>
                  </FormGroup>
                  <FormGroup label="Licence Number">
                    <input className="inp" placeholder="Enter number exactly as printed" />
                  </FormGroup>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setLicenceCount((n) => n + 1)}>
              + Add Another Licence / Market
            </Button>
            <div style={{ padding: 9, background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginTop: 10 }}>
              ℹ Licence numbers are used by DORA AI for the regulatory semantic check (F9).
            </div>
          </>
        ),
      },
      {
        title: 'Reference Image',
        subtitle: 'Step 4 of 4',
        content: (
          <>
            <div style={{ padding: 9, background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 12 }}>
              ℹ Provide <strong>1 clear, high-resolution reference image per side</strong>. Used on{' '}
              <a href={DORASCAN_VERIFY_BASE} target="_blank" rel="noreferrer" style={{ color: 'var(--bt)' }}>
                verify.dorascan.ai
              </a>{' '}
              and for DORA AI training on your first batch.
            </div>
            <FormGroup label="Label Configuration">
              <select className="inp" value={labelConfig} onChange={(e) => setLabelConfig(e.target.value as LabelConfig)}>
                <option value="2sided">2-Sided label (Front + Back)</option>
                <option value="1sided">Round or single-side label</option>
                <option value="6sided">Box labelled on multiple sides</option>
              </select>
            </FormGroup>
            <div style={{ padding: '9px 11px', background: 'var(--gb)', borderRadius: 7, fontSize: 12, color: 'var(--gt)', marginBottom: 11 }}>
              🏷️ One sharp, well-lit image per side is all that is needed for DORA AI training.
            </div>
            {imageZones}
          </>
        ),
      },
    ];
  }, [
    productName,
    manufacturer,
    productCategory,
    doraCategory,
    barcodeMode,
    barcodeNumber,
    sizeVolume,
    skuLabelName,
    labelConfig,
    licenceCount,
    imageFiles,
  ]);

  if (isEdit) {
    return (
      <Modal open={open} onClose={handleClose} title="Edit Product" subtitle="Update product details" width={480}>
        {error && (
          <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
            {error}
          </div>
        )}
        <FormGroup label="Product Name *">
          <input className="inp" value={productName} onChange={(e) => setProductName(e.target.value)} />
        </FormGroup>
        <FormGroup label="Manufacturer">
          <input className="inp" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
        </FormGroup>
        <FormGroup label="Barcode">
          <input className="inp" value={barcodeNumber} onChange={(e) => setBarcodeNumber(e.target.value)} />
        </FormGroup>
        <FormGroup label="Description">
          <input className="inp" value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormGroup>
        <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Reference images (optional)</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
            Upload new images to replace product reference photos used by DORA.
          </div>
          <ImageUploadZone
            label="Front Image"
            file={imageFiles.front}
            onFileChange={(f) => setImageFile('front', f)}
          />
          <ImageUploadZone
            label="Back Image"
            file={imageFiles.back}
            onFileChange={(f) => setImageFile('back', f)}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <>
      {error && open && (
        <div style={{ display: 'none' }} aria-live="polite">
          {error}
        </div>
      )}
      <StepWizardModal
        open={open}
        onClose={() => {
          if (!saving) handleClose();
        }}
        steps={wizardSteps}
        finishLabel={saving ? 'Creating…' : 'Create Product'}
        onFinish={handleSubmit}
        width={580}
      />
      {error && open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            padding: '9px 14px',
            background: 'var(--rb)',
            borderRadius: 7,
            fontSize: 12,
            color: 'var(--rt)',
            boxShadow: '0 4px 20px rgba(0,0,0,.15)',
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}
