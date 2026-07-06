import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';
import { useTableFilter } from '../../hooks/useTableFilter';

export function BatchListPage() {
  const { isReadOnly, navigateWithQuery } = useApp();
  const { batchRows, loading, setDoraUploadTarget } = useTenantData();
  const { openModal } = useModal();
  const { query, setQuery, filtered } = useTableFilter(batchRows, ['id', 'product', 'status']);

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
        <FilterBar>
          <input
            className="inp"
            placeholder="Search batches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FilterBar>
        {loading && batchRows.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Loading batches…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No batches yet. {isReadOnly ? '' : 'Create a product first, then add a batch.'}
          </div>
        ) : (
          <TableWrap minWidth={880}>
            <table>
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
                    className="cl"
                    onClick={() => !b.needsUpload && navigateWithQuery('/batches/detail', { id: b._id })}
                  >
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{b.id}</td>
                    <td>{b.product}</td>
                    <td>{b.created}</td>
                    <td>{b.qty}</td>
                    <td>
                      <Badge variant={b.statusVariant}>{b.status}</Badge>
                    </td>
                    <td>{b.auths}</td>
                    <td>{b.scans}</td>
                    <td>
                      <Badge variant={b.deliveryVariant} style={{ fontSize: 10 }}>
                        {b.delivery}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={b.doraVariant}>{b.dora}</Badge>
                    </td>
                    <td>
                      {b.needsUpload ? (
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
