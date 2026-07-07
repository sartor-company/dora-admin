import type { InvestigationRow } from '../api/investigations';
import type { PlatformInvoice } from '../api/billing';
import type { AnalyticsOverview } from '../types/analytics';
import type { ApiProduct } from '../types/api';
import type { CampaignListItem } from '../types/gifts';
import { downloadCsv, downloadPdfReport } from './export';

export const REPORT_DESCRIPTIONS: Record<string, string> = {
  auth: 'Scan volume, authentication rate, and outcome breakdown by SKU and date range.',
  batch: 'Per-batch scan rates, delivery status, and DORA model status.',
  fraud: 'Open investigations, resolved cases, and detected fraud patterns.',
  loyalty: 'Points issued, gift distribution, redemption rates, and top consumers.',
  credits: 'PIN, SMS, and batch calibration credit spend and remaining balances.',
  geo: 'Scan volume and warning rates by city and region.',
};

export interface ReportData {
  analytics: AnalyticsOverview | null;
  investigations: InvestigationRow[];
  products: ApiProduct[];
  campaigns: CampaignListItem[];
  invoices: PlatformInvoice[];
  companyName: string;
}

export function generateReport(
  reportType: string,
  format: 'csv' | 'pdf',
  data: ReportData,
): { ok: true } | { ok: false; message: string } {
  if (!reportType) return { ok: false, message: 'Select a report type' };

  const title = REPORT_DESCRIPTIONS[reportType] ? reportType : 'report';
  const stamp = new Date().toISOString().slice(0, 10);
  const { analytics, investigations, products, campaigns, invoices, companyName } = data;

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
    return { ok: false, message: 'Geo report will populate when location data is available on scans.' };
  } else {
    const headers = ['Product'];
    const rows = products.map((p) => [p.productName || '—']);
    if (format === 'csv') downloadCsv(`${title}-${stamp}.csv`, headers, rows);
    else downloadPdfReport({ title: 'Platform Report', company: companyName, headers, rows });
  }

  return { ok: true };
}
