import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useTenantData } from '../context/TenantDataContext';
import { generateReport } from '../utils/reports';

interface Props {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export function ReportsModal({ open, onClose, showToast }: Props) {
  const { companyName } = useApp();
  const { analytics, investigations, products, campaigns, invoices } = useTenantData();
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

  const handleGenerate = () => {
    const result = generateReport(reportType, format, {
      analytics,
      investigations,
      products,
      campaigns,
      invoices,
      companyName,
    });
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    onClose();
    showToast('Report downloaded', 'success');
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Report" width={480}>
      <FormGroup label="Report Type *">
        <select className="inp" value={reportType} onChange={(e) => setReportType(e.target.value)}>
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
          {products.map((p) => (
            <option key={p._id}>
              {p.productName}
              {p.batchId ? ` (${p.batchId})` : ''}
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup label="Format">
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              border: format === 'csv' ? '2px solid var(--navy)' : '1px solid var(--border)',
              borderRadius: 7,
              background: format === 'csv' ? 'var(--bb)' : undefined,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: format === 'csv' ? 600 : undefined,
              color: format === 'csv' ? 'var(--bt)' : undefined,
            }}
          >
            <input
              type="radio"
              name="mfmt"
              checked={format === 'csv'}
              onChange={() => setFormat('csv')}
              style={{ margin: 0 }}
            />{' '}
            CSV
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              border: format === 'pdf' ? '2px solid var(--navy)' : '1px solid var(--border)',
              borderRadius: 7,
              background: format === 'pdf' ? 'var(--bb)' : undefined,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: format === 'pdf' ? 600 : undefined,
              color: format === 'pdf' ? 'var(--bt)' : undefined,
            }}
          >
            <input
              type="radio"
              name="mfmt"
              checked={format === 'pdf'}
              onChange={() => setFormat('pdf')}
              style={{ margin: 0 }}
            />{' '}
            PDF
          </label>
        </div>
      </FormGroup>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleGenerate}>Generate & Download</Button>
      </ModalFooter>
    </Modal>
  );
}
