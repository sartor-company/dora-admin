import { ImgUploadZone } from '../components/ui/ImgUploadZone';
import type { StepDef } from '../components/wizards/StepWizardModal';

export const BATCH_WIZARD_STEPS: StepDef[] = [
  {
    title: 'Batch Details',
    subtitle: 'Step 1 of 4',
    content: (
      <>
        <div className="fg">
          <label className="fi">Product (SKU) *</label>
          <select className="inp">
            <option>Select product...</option>
            <option>Sartor Hand Sanitiser 500ml (SHS-001)</option>
            <option>Carabiner Holder Pack (CHP-002)</option>
          </select>
        </div>
        <div className="fg">
          <label className="fi">Batch Number *</label>
          <input className="inp" placeholder="e.g. BATCH-2026-Q2-001" />
        </div>
        <div className="fr2">
          <div className="fg">
            <label className="fi">Manufacture Date *</label>
            <input type="date" className="inp" />
          </div>
          <div className="fg">
            <label className="fi">Expiry Date *</label>
            <input type="date" className="inp" />
          </div>
        </div>
        <div className="fr2">
          <div className="fg">
            <label className="fi">Quantity *</label>
            <input type="number" className="inp" placeholder="Units in this batch" />
          </div>
          <div className="fg">
            <label className="fi">Supplier</label>
            <input className="inp" placeholder="Supplier name" />
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Serial Numbers',
    subtitle: 'Step 2 of 4',
    content: (
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 11 }}>
        Upload SN manifest (CSV/Excel) or auto-generate serial numbers.
      </p>
    ),
  },
  {
    title: 'Print Config',
    subtitle: 'Step 3 of 4',
    content: (
      <div className="fg">
        <label className="fi">PIN Format *</label>
        <select className="inp">
          <option>6-digit numeric</option>
          <option>8-digit numeric</option>
          <option>6-char alphanumeric</option>
        </select>
      </div>
    ),
  },
  {
    title: 'DORA Training Image',
    subtitle: 'Step 4 of 4',
    content: (
      <>
        <div className="fg">
          <label className="fi">Front Label Image *</label>
          <ImgUploadZone title="Upload front label image" hint="PNG, JPG · Max 20MB" />
        </div>
        <div className="fg">
          <label className="fi">Back Label Image</label>
          <ImgUploadZone title="Upload back label image" hint="PNG, JPG · Max 20MB" />
        </div>
      </>
    ),
  },
];
