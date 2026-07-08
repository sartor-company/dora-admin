import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { KCard, KCardGrid } from '../components/ui/KCard';
import { PageHeader } from '../components/ui/PageHeader';
import { TableWrap } from '../components/ui/TableWrap';
import { useModal } from '../context/ModalContext';
import { useTenantData } from '../context/TenantDataContext';
import { formatApiDate, invoiceStatusVariant } from '../utils/mappers';

export function InvoicesPage() {
  const { invoices, loading } = useTenantData();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus') || '';
  const [highlight, setHighlight] = useState(focusId);

  useEffect(() => {
    if (!focusId || !invoices.length) return;
    const match = invoices.find((inv) => inv.invoiceId === focusId || inv._id === focusId);
    if (!match) return;
    setHighlight(match.invoiceId);
    openModal('invoice-view', match);
    setSearchParams({}, { replace: true });
  }, [focusId, invoices, openModal, setSearchParams]);

  const metrics = useMemo(() => {
    const pending = invoices.filter((i) => i.status === 'Pending' || i.status === 'Due Soon').length;
    const overdue = invoices.filter((i) => i.status === 'Overdue').length;
    const paid = invoices.filter((i) => i.status === 'Paid').length;
    const outstanding = invoices
      .filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    return { pending, overdue, paid, outstanding };
  }, [invoices]);

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Track billing invoices and complete payments"
      />

      <KCardGrid>
        <KCard label="Total Invoices" value={String(invoices.length)} trend="All time" />
        <KCard
          label="Pending / Due"
          value={String(metrics.pending)}
          trend={metrics.overdue ? `${metrics.overdue} overdue` : 'Awaiting payment'}
          trendType={metrics.overdue ? 'dn' : 'neu'}
        />
        <KCard label="Paid" value={String(metrics.paid)} trend="Settled" trendType="up" />
        <KCard
          label="Outstanding"
          value={`₦${metrics.outstanding.toLocaleString()}`}
          trend="Amount due"
        />
      </KCardGrid>

      <Card>
        <TableWrap minWidth={760}>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Description</th>
                <th>Issued</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv._id}
                  style={
                    highlight === inv.invoiceId
                      ? { background: 'var(--bb)' }
                      : undefined
                  }
                >
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{inv.invoiceId}</td>
                  <td>{inv.description}</td>
                  <td>{formatApiDate(inv.issuedAt || inv.creationDateTime)}</td>
                  <td>₦{inv.amount.toLocaleString()}</td>
                  <td>
                    <Badge variant={invoiceStatusVariant(inv.status)}>{inv.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal('invoice-view', inv)}
                    >
                      View Invoice
                    </Button>
                  </td>
                </tr>
              ))}
              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                    No invoices yet.
                  </td>
                </tr>
              )}
              {loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                    Loading invoices…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}
