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
  const { companyName, navigateTo } = useApp();
  const { analytics, investigations, products, campaigns, invoices } = useTenantData();
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [skuFilter, setSkuFilter] = useState('');

  const handleGenerate = () => {
    if (!reportType) {
      showToast('Select a report type', 'warn');
      return;
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      showToast('Date From must be on or before Date To.', 'warn');
      return;
    }
    const filtered = skuFilter ? products.filter((p) => p._id === skuFilter) : products;
    const skuLabel = filtered.length === 1 ? filtered[0].productName : 'All products';
    const result = generateReport(reportType, format, {
      analytics,
      investigations,
      products: filtered,
      campaigns,
      invoices,
      companyName,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      skuLabel,
    });
    if (!result.ok) {
      showToast(result.message, 'warn');
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
          <option value="batch">Batch Performance — per-batch scan rates, DORA status</option>
          <option value="fraud">Fraud & Investigation Report</option>
          <option value="loyalty">Loyalty & Redemptions Report</option>
          <option value="credits">Credit Usage Report</option>
          <option value="geo">Geographic Distribution Report</option>
        </select>
      </FormGroup>
      <div className="fr2">
        <FormGroup label="Date From">
          <input type="date" className="inp" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </FormGroup>
        <FormGroup label="Date To">
          <input type="date" className="inp" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </FormGroup>
      </div>
      <FormGroup label="Product Filter">
        <select className="inp" value={skuFilter} onChange={(e) => setSkuFilter(e.target.value)}>
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.productName}
              {p.batchId ? ` (${p.batchId})` : ''}
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup label="Format">
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {(['csv', 'pdf'] as const).map((fmt) => (
            <label
              key={fmt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                border: format === fmt ? '2px solid var(--navy)' : '1px solid var(--border)',
                borderRadius: 7,
                background: format === fmt ? 'var(--bb)' : undefined,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: format === fmt ? 600 : undefined,
                color: format === fmt ? 'var(--bt)' : undefined,
              }}
            >
              <input
                type="radio"
                name="mfmt"
                checked={format === fmt}
                onChange={() => setFormat(fmt)}
                style={{ margin: 0 }}
              />{' '}
              {fmt.toUpperCase()}
            </label>
          ))}
        </div>
      </FormGroup>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
        For downloads history and scheduling notes, open the{' '}
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--bt)', fontWeight: 600, cursor: 'pointer', padding: 0, font: 'inherit' }}
          onClick={() => {
            onClose();
            navigateTo('/reports');
          }}
        >
          Reports page
        </button>
        .
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleGenerate}>Generate & Download</Button>
      </ModalFooter>
    </Modal>
  );
}
