import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAVY = [11, 22, 64] as [number, number, number];
const GOLD = [201, 162, 39] as [number, number, number];

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface PdfReportOptions {
  title: string;
  subtitle?: string;
  company: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string }[];
}

export function downloadPdfReport(opts: PdfReportOptions) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 56, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Sartor-Chain · DORASCAN', 40, 28);
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text('Client Admin Report', 40, 44);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text(opts.title, 40, 80);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(opts.company, 40, 96);
  if (opts.subtitle) doc.text(opts.subtitle, 40, 110);
  doc.text(`Generated ${new Date().toLocaleString('en-GB')}`, 40, opts.subtitle ? 124 : 110);

  let startY = opts.subtitle ? 140 : 126;

  if (opts.summary?.length) {
    const cols = 3;
    opts.summary.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 40 + col * 180;
      const y = startY + row * 36;
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(x, y, 165, 28, 4, 4, 'F');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(s.label, x + 10, y + 12);
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text(s.value, x + 10, y + 24);
    });
    startY += Math.ceil(opts.summary.length / cols) * 40 + 8;
  }

  autoTable(doc, {
    startY,
    head: [opts.headers],
    body: opts.rows.map((r) => r.map(String)),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    margin: { left: 40, right: 40 },
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pages} · Confidential — ${opts.company}`, 40, doc.internal.pageSize.getHeight() - 20);
  }

  doc.save(`${opts.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
}

export function downloadInvoicePdf(invoice: {
  invoiceId: string;
  description: string;
  status: string;
  amount: number;
  issuedAt?: number | string;
  creationDateTime?: number | string;
}, companyName: string) {
  const date =
    invoice.issuedAt || invoice.creationDateTime
      ? new Date(invoice.issuedAt || invoice.creationDateTime!).toLocaleDateString('en-GB')
      : '—';
  downloadPdfReport({
    title: `Invoice ${invoice.invoiceId}`,
    subtitle: 'Payable to Sartor Limited · RC 1845734',
    company: companyName,
    headers: ['Field', 'Value'],
    rows: [
      ['Invoice No.', invoice.invoiceId],
      ['Date', date],
      ['Description', invoice.description],
      ['Status', invoice.status],
      ['Amount (NGN)', invoice.amount.toLocaleString()],
    ],
    summary: [{ label: 'Total Due', value: `₦${invoice.amount.toLocaleString()}` }],
  });
}
