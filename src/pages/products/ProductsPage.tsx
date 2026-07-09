import { useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useModal } from '../../context/ModalContext';

export function ProductsPage() {
  const { companyName, isReadOnly, navigateWithQuery } = useApp();
  const { productRows, loading } = useTenantData();
  const { openModal } = useModal();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = useMemo(
    () => [...new Set(productRows.map((p) => p.category).filter((c) => c && c !== '—'))].sort(),
    [productRows],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return productRows.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [productRows, query, categoryFilter]);

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
        <div style={{ display: 'flex', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
          <input
            className="inp"
            style={{ flex: 1, minWidth: 160 }}
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="inp"
            style={{ width: 150 }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {loading && productRows.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No products yet. {isReadOnly ? '' : 'Click “Add Product” to create your first product.'}
          </div>
        ) : (
          <TableWrap minWidth={720}>
            <table className="resp">
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
                    <td data-label="">
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
                        {p.raw.productImage ? 'IMG' : 'IMG'}
                      </div>
                    </td>
                    <td data-label="Product">
                      <strong>{p.name}</strong>
                    </td>
                    <td
                      data-label="SKU"
                      style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                    >
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
                    <td data-label="Category">{p.category}</td>
                    <td data-label="Batches">{p.batches}</td>
                    <td data-label="Scans">{p.scans.toLocaleString()}</td>
                    <td
                      data-label="Auth Rate"
                      style={{ color: p.authRateColor ?? 'var(--gt)', fontWeight: 600 }}
                    >
                      {p.authRate}
                    </td>
                    <td data-label="DORA">
                      <Badge variant={p.doraVariant}>{p.doraStatus}</Badge>
                    </td>
                    <td data-label="">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateWithQuery('/products/detail', { id: p.id })}
                      >
                        View
                      </Button>
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
