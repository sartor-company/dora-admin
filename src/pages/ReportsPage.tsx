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
import { downloadCsv, downloadPdfReport } from '../utils/export';

const REPORT_DESCRIPTIONS: Record<string, string> = {
  auth: 'Scan volume, authentication rate, and outcome breakdown by SKU and date range.',
  batch: 'Per-batch scan rates, delivery status, and DORA model status.',
  fraud: 'Open investigations, resolved cases, and detected fraud patterns.',
  loyalty: 'Points issued, gift distribution, redemption rates, and top consumers.',
  credits: 'PIN, SMS, and batch calibration credit spend and remaining balances.',
  geo: 'Scan volume and warning rates by city and region.',
};

export function ReportsPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { companyName } = useApp();
  const { analytics, investigations, products, campaigns, invoices } = useTenantData();
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

  const generate = () => {
    if (!reportType) {
      showToast('Select a report type');
      return;
    }
    const title = REPORT_DESCRIPTIONS[reportType] ? reportType : 'report';
    const stamp = new Date().toISOString().slice(0, 10);

    if (reportType === 'auth' && analytics) {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total scans (30d)', analytics.kpis.totalScans],
        ['Auth rate', analytics.kpis.authRate != null ? `${analytics.kpis.authRate}%` : '—'],
        ['Fraud alerts', analytics.kpis.fraudAlerts],
        ['Active consumers', analytics.kpis.activeConsumers],
        ['PIN credits', analytics.kpis.pinCredits],
        ['SMS credits', analytics.kpis.smsCredits],
      ];
      if (format === 'csv') downloadCsv(`auth-summary-${stamp}.csv`, headers, rows);
      else
        downloadPdfReport({
          title: 'Authentication Summary',
          subtitle: 'Last 30 days',
          company: companyName,
          headers,
          rows,
        });
    } else if (reportType === 'fraud') {
      const headers = ['ID', 'Severity', 'Batch', 'Product', 'Status'];
      const rows = investigations.map((i) => [i.id, i.flag, i.batch, i.product, i.status]);
      if (format === 'csv') downloadCsv(`fraud-investigations-${stamp}.csv`, headers, rows);
      else
        downloadPdfReport({
          title: 'Fraud & Investigation Report',
          company: companyName,
          headers,
          rows,
          summary: [{ label: 'Open cases', value: String(investigations.filter((i) => i.status !== 'Closed').length) }],
        });
    } else if (reportType === 'batch') {
      const headers = ['Product', 'Batches', 'Scans', 'Auth rate'];
      const rows = (analytics?.topProducts || []).map((p) => [
        p.name,
        p.batches,
        p.scans,
        p.authRate != null ? `${p.authRate}%` : '—',
      ]);
      if (format === 'csv') downloadCsv(`batch-performance-${stamp}.csv`, headers, rows);
      else downloadPdfReport({ title: 'Batch Performance', company: companyName, headers, rows });
    } else if (reportType === 'loyalty') {
      const headers = ['Campaign', 'Status', 'Pools', 'Redeemed'];
      const rows = campaigns.map((c) => [c.name, c.status, c.pools, c.redeemed]);
      if (format === 'csv') downloadCsv(`loyalty-${stamp}.csv`, headers, rows);
      else downloadPdfReport({ title: 'Loyalty & Redemptions', company: companyName, headers, rows });
    } else if (reportType === 'credits') {
      const headers = ['Invoice', 'Description', 'Amount', 'Status'];
      const rows = invoices.map((i) => [i.invoiceId, i.description, i.amount, i.status]);
      if (format === 'csv') downloadCsv(`credits-billing-${stamp}.csv`, headers, rows);
      else downloadPdfReport({ title: 'Credit Usage & Billing', company: companyName, headers, rows });
    } else if (reportType === 'geo') {
      showToast('Geo report will populate when location data is available on scans.');
      return;
    } else {
      const headers = ['Product'];
      const rows = products.map((p) => [p.productName || '—']);
      if (format === 'csv') downloadCsv(`${title}-${stamp}.csv`, headers, rows);
      else downloadPdfReport({ title: 'Platform Report', company: companyName, headers, rows });
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
