import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { batches } from '../../data/mock';
import { useTableFilter } from '../../hooks/useTableFilter';

export function BatchListPage() {
  const { isReadOnly, navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { query, setQuery, filtered } = useTableFilter(batches, ['id', 'product', 'status']);

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
          <select className="inp">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending Model</option>
            <option>Training</option>
            <option>Closed</option>
          </select>
        </FilterBar>
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
                key={b.id}
                className="cl"
                onClick={() => !b.needsUpload && navigateLegacy('pg-batch-detail')}
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
                        openModal('dora');
                      }}
                    >
                      Upload Image
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableWrap>
      </Card>
    </>
  );
}
