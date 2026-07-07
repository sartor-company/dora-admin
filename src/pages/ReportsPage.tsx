import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormGroup } from '../components/ui/FormGroup';
import { PageHeader } from '../components/ui/PageHeader';
import { Toggle } from '../components/ui/Toggle';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';
import { generateReport, REPORT_DESCRIPTIONS } from '../utils/reports';

export function ReportsPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { companyName } = useApp();
  const { analytics, investigations, products, campaigns, invoices } = useTenantData();
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

  const generate = () => {
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
    showToast('Report downloaded', 'success');
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and download platform reports" />

      <div className="r2">
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div className="ct" style={{ marginBottom: 13 }}>
              Generate Report
            </div>
            <FormGroup label="Report Type">
              <select
                className="inp"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="">Select report type...</option>
                <option value="auth">Authentication Summary — scan volume, auth rate, outcome breakdown</option>
                <option value="batch">Batch Performance — per-batch scan rates, delivery status, model status</option>
                <option value="fraud">Fraud & Investigation Report — open cases, resolved, patterns</option>
                <option value="loyalty">Loyalty & Redemptions — points issued, gift distribution, top consumers</option>
                <option value="credits">Credit Usage Report — PIN, SMS, calibration spend and balance</option>
                <option value="geo">Geographic Distribution — scan volume and warning rates by region</option>
              </select>
            </FormGroup>
            {reportType && REPORT_DESCRIPTIONS[reportType] && (
              <div
                style={{
                  padding: 9,
                  background: 'var(--bb)',
                  borderRadius: 7,
                  fontSize: 12,
                  color: 'var(--bt)',
                  marginBottom: 13,
                }}
              >
                {REPORT_DESCRIPTIONS[reportType]}
              </div>
            )}
            <div className="fr2">
              <FormGroup label="Date From *">
                <input type="date" className="inp" />
              </FormGroup>
              <FormGroup label="Date To *">
                <input type="date" className="inp" />
              </FormGroup>
            </div>
            <FormGroup label="SKU Filter (optional — leave blank for all products)">
              <select className="inp">
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p._id}>{p.productName}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Export Format">
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {(['csv', 'pdf'] as const).map((fmt) => (
                  <label
                    key={fmt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      border: format === fmt ? '2px solid var(--navy)' : '1px solid var(--border)',
                      borderRadius: 7,
                      background: format === fmt ? 'var(--bb)' : undefined,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: format === fmt ? 600 : 500,
                      color: format === fmt ? 'var(--bt)' : 'var(--text2)',
                    }}
                  >
                    <input
                      type="radio"
                      name="fmt"
                      value={fmt}
                      checked={format === fmt}
                      onChange={() => setFormat(fmt)}
                      style={{ margin: 0 }}
                    />
                    {fmt.toUpperCase()}
                  </label>
                ))}
              </div>
            </FormGroup>
            <Button
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={generate}
            >
              Generate & Download Report
            </Button>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 12 }}>
            <div className="ct" style={{ marginBottom: 11 }}>
              Recent Reports
            </div>
            <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
              {[
                { name: 'Authentication Summary', detail: 'Apr 1–Apr 30, 2026 · All SKUs · CSV' },
                { name: 'Loyalty & Redemptions', detail: 'Mar 1–Mar 31, 2026 · All SKUs · PDF' },
                { name: 'Batch Performance', detail: 'Q1 2026 · SHS-001 · CSV' },
                { name: 'Fraud & Investigation', detail: 'Jan 1–Mar 31, 2026 · All SKUs · PDF' },
              ].map((r) => (
                <div
                  key={r.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 9,
                    background: 'var(--bg)',
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ color: 'var(--text3)' }}>{r.detail}</div>
                  </div>
                  <button
                    type="button"
                    style={{
                      color: 'var(--bt)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      font: 'inherit',
                    }}
                    onClick={() => showToast('Downloading report...')}
                  >
                    ↓ Download
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="ct" style={{ marginBottom: 11 }}>
              Scheduled Reports
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 11 }}>
              Set up automatic weekly or monthly reports delivered to your email.
            </div>
            <div className="twrap">
              <div>
                <div className="tlbl">Weekly Authentication Summary</div>
                <div className="tdesc">Every Monday, 8am WAT · All SKUs · CSV</div>
              </div>
              <Toggle defaultOn />
            </div>
            <div className="twrap">
              <div>
                <div className="tlbl">Monthly Batch Performance</div>
                <div className="tdesc">1st of each month · All SKUs · PDF</div>
              </div>
              <Toggle />
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="secondary" size="sm" onClick={() => openModal('reports')}>
                + Add Schedule
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
