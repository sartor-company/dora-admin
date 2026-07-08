import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormGroup } from '../components/ui/FormGroup';
import { PageHeader } from '../components/ui/PageHeader';
import { useApp } from '../context/AppContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';
import { generateReport, REPORT_DESCRIPTIONS } from '../utils/reports';

const REPORT_HISTORY_KEY = 'dora-report-history';

type ReportHistoryItem = {
  id: string;
  name: string;
  type: string;
  format: 'csv' | 'pdf';
  detail: string;
  at: number;
};

function loadHistory(): ReportHistoryItem[] {
  try {
    const raw = localStorage.getItem(REPORT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReportHistoryItem[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: ReportHistoryItem[]) {
  localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
}

function reportLabel(type: string) {
  const map: Record<string, string> = {
    auth: 'Authentication Summary',
    batch: 'Batch Performance',
    fraud: 'Fraud & Investigation',
    loyalty: 'Loyalty & Redemptions',
    credits: 'Credit Usage',
    geo: 'Geographic Distribution',
  };
  return map[type] || 'Report';
}

export function ReportsPage() {
  const { showToast } = useToast();
  const { companyName } = useApp();
  const { analytics, investigations, products, campaigns, invoices } = useTenantData();
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [history, setHistory] = useState<ReportHistoryItem[]>(() => loadHistory());

  const filteredProducts = useMemo(() => {
    if (!skuFilter) return products;
    return products.filter((p) => p._id === skuFilter);
  }, [products, skuFilter]);

  const periodLabel = useMemo(() => {
    if (dateFrom && dateTo) return `${dateFrom} → ${dateTo}`;
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo) return `Until ${dateTo}`;
    return 'Current snapshot';
  }, [dateFrom, dateTo]);

  const runDownload = (type: string, exportFormat: 'csv' | 'pdf') => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      showToast('Date From must be on or before Date To.', 'warn');
      return;
    }
    const skuName = filteredProducts.length === 1 ? filteredProducts[0].productName : 'All products';
    const result = generateReport(type, exportFormat, {
      analytics,
      investigations,
      products: filteredProducts.length ? filteredProducts : products,
      campaigns,
      invoices,
      companyName,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      skuLabel: skuName,
    });
    if (!result.ok) {
      showToast(result.message, 'warn');
      return;
    }
    const item: ReportHistoryItem = {
      id: `${Date.now()}`,
      name: reportLabel(type),
      type,
      format: exportFormat,
      detail: `${periodLabel} · ${skuName} · ${exportFormat.toUpperCase()}`,
      at: Date.now(),
    };
    const next = [item, ...history.filter((h) => !(h.type === type && h.format === exportFormat))].slice(0, 8);
    setHistory(next);
    saveHistory(next);
    showToast(`${item.name} downloaded`, 'success');
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and download platform reports from live data" />

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
                <option value="batch">Batch Performance — per-batch scan rates, model status</option>
                <option value="fraud">Fraud & Investigation Report — open cases, resolved, patterns</option>
                <option value="loyalty">Loyalty & Redemptions — points issued, gift distribution</option>
                <option value="credits">Credit Usage Report — PIN, SMS, calibration spend and balance</option>
                <option value="geo">Geographic Distribution — scan volume by region</option>
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
              <FormGroup label="Date From">
                <input
                  type="date"
                  className="inp"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Date To">
                <input
                  type="date"
                  className="inp"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </FormGroup>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', margin: '-6px 0 12px' }}>
              Optional. Applied where the report includes dated rows (invoices, investigations). KPIs remain a live snapshot.
            </div>
            <FormGroup label="SKU Filter (optional — leave blank for all products)">
              <select
                className="inp"
                value={skuFilter}
                onChange={(e) => setSkuFilter(e.target.value)}
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName}
                  </option>
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
              onClick={() => {
                if (!reportType) {
                  showToast('Select a report type', 'warn');
                  return;
                }
                runDownload(reportType, format);
              }}
            >
              Generate & Download Report
            </Button>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 12 }}>
            <div className="ct" style={{ marginBottom: 11 }}>
              Downloaded this session
            </div>
            {history.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 0' }}>
                No downloads yet. Generate a report and it will appear here for quick re-download.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
                {history.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 9,
                      background: 'var(--bg)',
                      borderRadius: 6,
                      gap: 8,
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
                        flexShrink: 0,
                      }}
                      onClick={() => runDownload(r.type, r.format)}
                    >
                      ↓ Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="ct" style={{ marginBottom: 11 }}>
              Scheduled Reports
            </div>
            <div
              style={{
                padding: 12,
                background: 'var(--bb)',
                borderRadius: 7,
                fontSize: 12,
                color: 'var(--bt)',
                lineHeight: 1.55,
              }}
            >
              Email scheduling is not enabled yet. For now, generate reports on demand from this page.
              Contact <strong>support@sartor.ng</strong> if you need a recurring delivery set up manually.
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
