import { ImgUploadZone } from '../components/ui/ImgUploadZone';
import type { StepDef } from '../components/wizards/StepWizardModal';

export const PRODUCT_WIZARD_STEPS: StepDef[] = [
  {
    title: 'Basic Info',
    subtitle: 'Step 1 of 4',
    content: (
      <>
        <div className="fg">
          <label className="fi">Product Name *</label>
          <input className="inp" placeholder="Full product name as printed on label" />
        </div>
        <div className="fg">
          <label className="fi">Manufacturer *</label>
          <input className="inp" placeholder="Search or add manufacturer" />
        </div>
        <div className="fg">
          <label className="fi">Product Category *</label>
          <select className="inp">
            <option>Select...</option>
            <option>Personal Care</option>
            <option>Accessories</option>
            <option>FMCG</option>
            <option>Pharmaceutical</option>
          </select>
        </div>
      </>
    ),
  },
  {
    title: 'Barcode & Specifications',
    subtitle: 'Step 2 of 4',
    content: (
      <>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
          Every product on SartorChain has a unique Sartor Authentication Code generated
          automatically.
        </div>
        <div className="fr2">
          <div className="fg">
            <label className="fi">Size / Volume</label>
            <input className="inp" placeholder="e.g. 500ml, 250g" />
          </div>
          <div className="fg">
            <label className="fi">SKU Name (as printed on label)</label>
            <input className="inp" placeholder="Exact name on label" />
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Regulatory Licences',
    subtitle: 'Step 3 of 4',
    content: (
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>Licence 1</div>
        <div className="fr2">
          <div className="fg">
            <label className="fi">Authority</label>
            <select className="inp">
              <option>NAFDAC</option>
              <option>SON</option>
            </select>
          </div>
          <div className="fg">
            <label className="fi">Licence Number</label>
            <input className="inp" placeholder="Enter number" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Reference Image',
    subtitle: 'Step 4 of 4',
    content: (
      <>
        <div className="fg">
          <label className="fi">Front Image *</label>
          <ImgUploadZone title="Upload front label image" hint="PNG, JPG, TIFF · Max 20MB" />
        </div>
        <div className="fg">
          <label className="fi">Back Image</label>
          <ImgUploadZone title="Upload back label image" hint="PNG, JPG, TIFF · Max 20MB" />
        </div>
      </>
    ),
  },
];
