import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { products } from '../../data/mock';
import { useTableFilter } from '../../hooks/useTableFilter';

export function ProductsPage() {
  const { companyName, isReadOnly, navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { query, setQuery, filtered } = useTableFilter(products, ['name', 'sku', 'category']);

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={companyName}
        actions={
          !isReadOnly ? (
            <Button onClick={() => openModal('product')}>+ Add Product</Button>
          ) : undefined
        }
      />

      <Card>
        <FilterBar>
          <input
            className="inp"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="inp">
            <option>All Categories</option>
            <option>Personal Care</option>
            <option>Accessories</option>
          </select>
        </FilterBar>
        <TableWrap minWidth={720}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 28 }}></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Batches</th>
              <th>Scans</th>
              <th>Auth Rate</th>
              <th>DORA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      background: 'var(--bg2)',
                      borderRadius: 5,
                      fontSize: 9,
                      color: 'var(--text3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    IMG
                  </div>
                </td>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                  {p.sku}{' '}
                  <span
                    style={{
                      fontSize: 9,
                      background: p.codeType === 'GS1' ? 'var(--gb)' : 'var(--bg2)',
                      color: p.codeType === 'GS1' ? 'var(--gt)' : 'var(--text2)',
                      padding: '1px 4px',
                      borderRadius: 3,
                      fontFamily: 'inherit',
                    }}
                  >
                    {p.codeType}
                  </span>
                </td>
                <td>{p.category}</td>
                <td>{p.batches}</td>
                <td>{p.scans.toLocaleString()}</td>
                <td style={{ color: p.authRateColor ?? 'var(--gt)', fontWeight: 600 }}>
                  {p.authRate}%
                </td>
                <td>
                  <Badge variant={p.doraVariant}>{p.doraStatus}</Badge>
                </td>
                <td>
                  <Button variant="secondary" size="sm" onClick={() => navigateLegacy('pg-product-detail')}>
                    View
                  </Button>
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
