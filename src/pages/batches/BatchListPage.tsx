import { useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';

const STATUS_FILTERS = ['', 'Active', 'Pending Model', 'Training', 'Paused', 'Closed'];

export function BatchListPage() {
  const { isReadOnly, navigateWithQuery } = useApp();
  const { batchRows, loading, setDoraUploadTarget } = useTenantData();
  const { openModal } = useModal();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  const productOptions = useMemo(
    () => [...new Set(batchRows.map((b) => b.product).filter(Boolean))].sort(),
    [batchRows],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const pf = productFilter.toLowerCase().trim();
    return batchRows.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (pf && !b.product.toLowerCase().includes(pf)) return false;
      if (!q) return true;
      return (
        b.id.toLowerCase().includes(q) ||
        b.product.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
      );
    });
  }, [batchRows, query, statusFilter, productFilter]);

  const openDoraUpload = (row: (typeof batchRows)[0]) => {
    if (!row.productId) return;
    setDoraUploadTarget({
      batchId: row._id,
      productId: row.productId,
      batchNumber: row.id,
      productName: row.product,
    });
    openModal('dora');
  };

  return (
    <>
      <PageHeader
        title="Batches"
        subtitle="Generate and manage AI-authenticated product batches"
        actions={
          !isReadOnly ? (
            <Button onClick={() => openModal('batch')}>+ Create Batch</Button>
          ) : undefined
        }
      />

      <Card>
        <div style={{ display: 'flex', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
          <input
            className="inp"
            style={{ flex: 1, minWidth: 160 }}
            placeholder="Search batches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="inp"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUS_FILTERS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="inp"
            list="batch-product-filter"
            style={{ width: 170 }}
            placeholder="Filter by product…"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            aria-label="Filter by product"
          />
          <datalist id="batch-product-filter">
            {productOptions.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        {loading && batchRows.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            Loading batches…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No batches yet. {isReadOnly ? '' : 'Create a product first, then add a batch.'}
          </div>
        ) : (
          <TableWrap minWidth={880}>
            <table className="resp">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Product</th>
                  <th>Created</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Auths</th>
                  <th>Scans</th>
                  <th>Delivery</th>
                  <th>DORA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b._id}
                    className={b.canView ? 'cl' : undefined}
                    onClick={() => b.canView && navigateWithQuery('/batches/detail', { id: b._id })}
                  >
                    <td data-label="Batch ID" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                      {b.id}
                    </td>
                    <td data-label="Product">{b.product}</td>
                    <td data-label="Created">{b.created}</td>
                    <td data-label="Qty">{b.qty}</td>
                    <td data-label="Status">
                      <Badge variant={b.statusVariant}>{b.status}</Badge>
                    </td>
                    <td data-label="Auths">{b.auths}</td>
                    <td data-label="Scans">{b.scans}</td>
                    <td data-label="Delivery">
                      <Badge variant={b.deliveryVariant} style={{ fontSize: 10 }}>
                        {b.delivery}
                      </Badge>
                    </td>
                    <td data-label="DORA">
                      <Badge variant={b.doraVariant}>{b.dora}</Badge>
                    </td>
                    <td data-label="Actions">
                      {b.needsUpload && !isReadOnly ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDoraUpload(b);
                          }}
                        >
                          Upload Image
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateWithQuery('/batches/detail', { id: b._id });
                          }}
                        >
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
