import { useMemo, useState } from 'react';
import { batchesApi } from '../api/batches';
import { labelsApi } from '../api/labels';
import { suppliersApi } from '../api/suppliers';
import { StepWizardModal, type StepDef } from '../components/wizards/StepWizardModal';
import { ChoiceCard } from '../components/wizards/ChoiceCard';
import { ImageUploadZone } from '../components/wizards/ImageUploadZone';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Toggle } from '../components/ui/Toggle';
import { consumerVerifyUrl, DORASCAN_VERIFY_BASE } from '../constants/dorascan';
import { useTenantData } from '../context/TenantDataContext';
import { useAuthStore } from '../store/authStore';
import { downloadCsv } from '../utils/export';

interface BatchCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SnMode = 'upload' | 'auto';
type LabelConfig = '2sided' | '1sided' | '6sided';

function generateBatchNumber() {
  return `BATCH-2026-Q2-${Math.floor(Math.random() * 900) + 100}`;
}

function downloadSampleSnManifest(batchNumber: string) {
  const sampleBatch = batchNumber.trim() || 'BATCH-SAMPLE-001';
  const prefix = sampleBatch.replace(/[^A-Za-z0-9]/g, '').slice(0, 12) || 'BATCHSAMPLE';
  const rows = Array.from({ length: 8 }, (_, i) => [
    `${prefix}-${String(i + 1).padStart(4, '0')}`,
  ]);
  downloadCsv('sn-manifest-sample.csv', ['serial_number'], rows);
}

function parseCsvRow(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cols.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cols.push(current.trim());
  return cols.map((v) => v.replace(/^"|"$/g, '').trim());
}

async function parseSnManifest(file: File): Promise<string[]> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error('SN manifest is empty.');

  const header = parseCsvRow(lines[0]).map((h) => h.toLowerCase());
  const snIndex = header.findIndex((h) => h === 'serial_number' || h === 'serialnumber' || h === 'serial');
  if (snIndex < 0) throw new Error("SN manifest must contain a 'serial_number' column.");

  const serials = lines
    .slice(1)
    .map((line) => parseCsvRow(line)[snIndex] || '')
    .map((v) => v.trim())
    .filter(Boolean);

  if (!serials.length) throw new Error('SN manifest has no serial numbers.');

  return serials;
}

export function BatchCreateModal({ open, onClose, onSuccess }: BatchCreateModalProps) {
  const { products, refreshBatches } = useTenantData();
  const user = useAuthStore((s) => s.user);
  const clientCode = user?.clientCode;

  const [productId, setProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [snMode, setSnMode] = useState<SnMode>('auto');
  const [snFile, setSnFile] = useState<File | null>(null);
  const [pinFormat, setPinFormat] = useState('10an');
  const [cartonQr, setCartonQr] = useState(true);
  const [unitsPerCarton, setUnitsPerCarton] = useState('24');
  const [labelConfig, setLabelConfig] = useState<LabelConfig>('2sided');
  const [doraImages, setDoraImages] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setProductId('');
    setBatchNumber('');
    setManufactureDate('');
    setExpiryDate('');
    setQuantity('');
    setSupplier('');
    setSnMode('auto');
    setSnFile(null);
    setPinFormat('10an');
    setCartonQr(true);
    setUnitsPerCarton('24');
    setLabelConfig('2sided');
    setDoraImages({ front: null, back: null });
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!productId || !batchNumber.trim() || !quantity || !expiryDate) {
      setError('Product, batch number, quantity, and expiry date are required.');
      throw new Error('validation');
    }
    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      setError('Quantity must be at least 1.');
      throw new Error('validation');
    }
    if (!user?.email) {
      setError('Account email missing — sign in again.');
      throw new Error('validation');
    }

    setSaving(true);
    setError('');
    try {
      let serialNumbers: string[] | undefined;
      if (snMode === 'upload') {
        if (!snFile) {
          setError('Upload your SN manifest file.');
          throw new Error('validation');
        }
        serialNumbers = await parseSnManifest(snFile);
        const uniq = new Set(serialNumbers);
        if (uniq.size !== serialNumbers.length) {
          setError('SN manifest contains duplicate serial numbers.');
          throw new Error('validation');
        }
        if (serialNumbers.length !== qty) {
          setError(`SN manifest rows (${serialNumbers.length}) must match quantity (${qty}).`);
          throw new Error('validation');
        }
      }

      const supplierRec = await suppliersApi.ensureDefault(user.email, user.fullName);
      const selected = products.find((p) => p._id === productId);
      const mfr = supplier.trim() || selected?.manufacturer || user.fullName || 'Manufacturer';
      const expiryTs = new Date(expiryDate).getTime();
      const manufactureTs = manufactureDate ? new Date(manufactureDate).getTime() : undefined;

      const created = await batchesApi.create({
        manufacturer: mfr,
        product: productId,
        invoiceNumber: `INV-${Date.now()}`,
        supplier: supplierRec._id,
        batch: [
          {
            quantity: qty,
            batchNumber: batchNumber.trim(),
            expiryDate: expiryTs,
            manufactureDate: manufactureTs ?? null,
            snMode,
            serialNumbers,
            pinFormat,
            unitsPerCarton: parseInt(unitsPerCarton, 10) || 24,
            cartonQrEnabled: cartonQr,
            labelConfig,
          },
        ],
      });
      const batchId = created[0]?._id;
      if (batchId && doraImages.front) {
        const back = doraImages.back || doraImages.front;
        await labelsApi.upload(productId, batchId, doraImages.front, back);
      }
      await refreshBatches();
      reset();
      onSuccess();
    } catch (e) {
      if (e instanceof Error && e.message === 'validation') throw e;
      setError(e instanceof Error ? e.message : 'Could not create batch.');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const verifyUrl = consumerVerifyUrl(clientCode);

  const steps = useMemo((): StepDef[] => {
    const doraZones =
      labelConfig === '1sided' ? (
        <ImageUploadZone
          label="Label Image * (1 image)"
          required
          file={doraImages.front}
          onFileChange={(f) => setDoraImages((prev) => ({ ...prev, front: f }))}
        />
      ) : labelConfig === '6sided' ? (
        ['Top', 'Front', 'Right', 'Back', 'Left', 'Bottom'].map((side) => (
          <ImageUploadZone
            key={side}
            label={`${side} (1 image)${side === 'Front' ? ' *' : ''}`}
            required={side === 'Front'}
            file={side === 'Front' ? doraImages.front : side === 'Back' ? doraImages.back : null}
            onFileChange={(f) => {
              if (side === 'Front') setDoraImages((prev) => ({ ...prev, front: f }));
              if (side === 'Back') setDoraImages((prev) => ({ ...prev, back: f }));
            }}
          />
        ))
      ) : (
        <>
          <ImageUploadZone
            label="Front Label Image (1 image) *"
            required
            file={doraImages.front}
            onFileChange={(f) => setDoraImages((prev) => ({ ...prev, front: f }))}
          />
          <ImageUploadZone
            label="Back Label Image (1 image)"
            file={doraImages.back}
            onFileChange={(f) => setDoraImages((prev) => ({ ...prev, back: f }))}
          />
        </>
      );

    return [
      {
        title: 'Batch Details',
        subtitle: 'Step 1 of 4',
        content: (
          <>
            <FormGroup label="Product (SKU) *">
              <select className="inp" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Batch Number *">
              <div style={{ display: 'flex', gap: 7 }}>
                <input
                  className="inp"
                  placeholder="e.g. BATCH-2026-Q2-001"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button variant="secondary" size="sm" onClick={() => setBatchNumber(generateBatchNumber())}>
                  ✦ Generate
                </Button>
              </div>
            </FormGroup>
            <div className="fr2">
              <FormGroup label="Manufacture Date *">
                <input type="date" className="inp" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} />
              </FormGroup>
              <FormGroup label="Expiry Date *">
                <input type="date" className="inp" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </FormGroup>
            </div>
            <div className="fr2">
              <FormGroup label="Quantity *">
                <input
                  type="number"
                  className="inp"
                  min={1}
                  placeholder="Units in this batch"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Supplier">
                <input className="inp" placeholder="Supplier name" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
              </FormGroup>
            </div>
            <FormGroup label="🔒 Verification URL (auto-configured)">
              <input className="inp" value={verifyUrl} readOnly style={{ background: 'var(--bg2)', color: 'var(--text2)' }} />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                One QR per sticker order encoding this URL. Consumers verify at{' '}
                <a href={DORASCAN_VERIFY_BASE} target="_blank" rel="noreferrer" style={{ color: 'var(--bt)' }}>
                  verify.dorascan.ai
                </a>
                .
              </div>
            </FormGroup>
          </>
        ),
      },
      {
        title: 'Serial Numbers',
        subtitle: 'Step 2 of 4',
        content: (
          <>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 11 }}>How should serial numbers be assigned?</p>
            <div style={{ display: 'grid', gap: 8 }}>
              <ChoiceCard
                selected={snMode === 'upload'}
                title="📄 Upload SN Manifest"
                description="CSV or Excel · Required column: serial_number"
                onClick={() => setSnMode('upload')}
              />
              <ChoiceCard
                selected={snMode === 'auto'}
                title="⚡ Auto-generate Serial Numbers"
                description="Format: SC-BATCH-43-0001, SC-BATCH-43-0002…"
                onClick={() => setSnMode('auto')}
              />
            </div>
            {snMode === 'upload' && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: 'var(--ab)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--at)',
                }}
              >
                Upload CSV with required <strong>serial_number</strong> column. The number of rows must exactly match
                the batch quantity.
                <div style={{ marginTop: 10 }}>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="inp"
                    onChange={(e) => setSnFile(e.target.files?.[0] ?? null)}
                  />
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
                    {snFile ? `Selected: ${snFile.name}` : 'No file selected'}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadSampleSnManifest(batchNumber)}
                  >
                    ↓ Download Sample SN Manifest
                  </Button>
                </div>
              </div>
            )}
          </>
        ),
      },
      {
        title: 'Print Config',
        subtitle: 'Step 3 of 4',
        content: (
          <>
            <FormGroup label="PIN Format *" hint="The PIN is the unique per-unit code on your scratch-off panel.">
              <select className="inp" value={pinFormat} onChange={(e) => setPinFormat(e.target.value)}>
                <option value="10an">10-digit alphanumeric</option>
                <option value="6n">6-digit numeric</option>
                <option value="8n">8-digit numeric</option>
                <option value="6a">6-char alphanumeric</option>
              </select>
            </FormGroup>
            <div style={{ padding: '11px 13px', background: 'var(--gb)', borderRadius: 8, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gt)', marginBottom: 4 }}>
                ✓ Your unit label barcode is already configured from product registration
              </div>
              <div style={{ fontSize: 12, color: 'var(--gt)' }}>
                Your batch print package includes your PIN only — nothing else to print per unit.
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Carton label for this batch</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 11 }}>
                A single QR label for outer cartons — scanned at each supply-chain handoff.
              </div>
              <div className="twrap" style={{ padding: '10px 0', borderBottom: '1px solid var(--bg2)' }}>
                <div>
                  <div className="tlbl" style={{ fontSize: 13, fontWeight: 500 }}>
                    Generate carton QR label
                  </div>
                  <div className="tdesc">Used with Sartor CRM for delivery confirmation.</div>
                </div>
                <Toggle on={cartonQr} onChange={setCartonQr} />
              </div>
              <FormGroup label="Units per carton">
                <input
                  type="number"
                  className="inp"
                  placeholder="e.g. 24"
                  style={{ maxWidth: 100 }}
                  value={unitsPerCarton}
                  onChange={(e) => setUnitsPerCarton(e.target.value)}
                />
              </FormGroup>
            </div>
          </>
        ),
      },
      {
        title: 'DORA Training Image',
        subtitle: 'Step 4 of 4',
        content: (
          <>
            <div style={{ padding: 9, background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 10 }}>
              ℹ You can skip this — the batch stays in <strong>PENDING MODEL</strong> until images are submitted.
            </div>
            <div style={{ padding: 9, background: 'var(--gb)', borderRadius: 7, fontSize: 12, color: 'var(--gt)', marginBottom: 12 }}>
              🏷️ <strong>DORA AI indexing completes in under 15 minutes.</strong> Upload 1–2 whole-product photos (front
              &amp; back, full container in frame).
            </div>
            <FormGroup label="Label Type">
              <select className="inp" value={labelConfig} onChange={(e) => setLabelConfig(e.target.value as LabelConfig)}>
                <option value="2sided">2-Sided (Front + Back)</option>
                <option value="1sided">Round / Single Side</option>
                <option value="6sided">6-Sided Box</option>
              </select>
            </FormGroup>
            {doraZones}
            <div style={{ padding: 9, background: 'var(--ab)', borderRadius: 7, fontSize: 12, color: 'var(--at)', marginTop: 10 }}>
              ⚠ DORA uses OCR + Vision-Language AI comparison — no lengthy training pipeline required.
            </div>
          </>
        ),
      },
    ];
  }, [
    products,
    productId,
    batchNumber,
    manufactureDate,
    expiryDate,
    quantity,
    supplier,
    snMode,
    pinFormat,
    cartonQr,
    unitsPerCarton,
    labelConfig,
    doraImages,
    verifyUrl,
  ]);

  return (
    <>
      <StepWizardModal
        open={open}
        onClose={() => {
          if (!saving) handleClose();
        }}
        steps={steps}
        width={580}
        finishLabel={saving ? 'Creating…' : 'Create Batch'}
        onFinish={handleSubmit}
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
