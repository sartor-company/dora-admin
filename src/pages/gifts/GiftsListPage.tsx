import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/ui/FilterBar';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { campaigns } from '../../data/mock';
import { useTableFilter } from '../../hooks/useTableFilter';

function ScopeBadge({ scope }: { scope: 'CLIENT_WIDE' | 'SKU_SPECIFIC' }) {
  const isWide = scope === 'CLIENT_WIDE';
  return (
    <span
      style={{
        display: 'inline-flex',
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 4,
        background: isWide ? 'var(--pb)' : 'var(--bb)',
        color: isWide ? 'var(--pt)' : 'var(--bt)',
      }}
    >
      {scope}
    </span>
  );
}

export function GiftsListPage() {
  const { isReadOnly, navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { query, setQuery, filtered } = useTableFilter(campaigns, ['name', 'subtitle', 'status']);

  return (
    <>
      <PageHeader
        title="Gift Campaigns"
        subtitle="Create and manage loyalty gift campaigns for your consumers"
        actions={
          <div className="pghead-actions" style={{ marginBottom: 0 }}>
            <Button variant="secondary" size="sm" onClick={() => showToast('CSV exported')}>
              Export CSV
            </Button>
            {!isReadOnly && (
              <Button size="sm" onClick={() => openModal('create-campaign')}>
                + Create Campaign
              </Button>
            )}
          </div>
        }
      />

      {isReadOnly && (
        <RestrictBanner>
          🔒 Read-only view. Only Batch Admins and Account Owners can create or modify campaigns.
        </RestrictBanner>
      )}

      <KCardGrid>
        <KCard label="Active Campaigns" value="3" trend="2 CLIENT_WIDE · 1 SKU-specific" trendType="up" />
        <KCard label="Total Eligibility Events" value="1,284" trend="↑ 23% this month" trendType="up" />
        <KCard label="Codes Generated" value="1,241" trend="97% fulfil rate" trendType="neu" />
        <KCard label="Redemption Rate" value="72.4%" trend="↑ 8% vs last month" trendType="up" />
      </KCardGrid>

      <Card>
        <FilterBar>
          <input
            className="inp"
            placeholder="Search campaigns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="inp">
            <option>All Scopes</option>
            <option>CLIENT_WIDE</option>
            <option>SKU_SPECIFIC</option>
          </select>
          <select className="inp">
            <option>All Statuses</option>
            <option>Draft</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Ended</option>
          </select>
        </FilterBar>
        <TableWrap minWidth={760}>
        <table>
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Date Range</th>
              <th>Pools</th>
              <th>Eligible</th>
              <th>Redeemed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className={!c.isDraft && !c.isEnded ? 'cl' : undefined}
                onClick={() => !c.isDraft && !c.isEnded && navigateLegacy('pg-gifts-detail')}
              >
                <td>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.subtitle}</div>
                </td>
                <td>
                  <ScopeBadge scope={c.scope} />
                </td>
                <td>
                  <Badge variant={c.statusVariant}>{c.status}</Badge>
                </td>
                <td style={{ fontSize: 12, color: c.isEnded ? 'var(--text3)' : undefined }}>
                  {c.dateStart}
                  {c.dateEnd && (
                    <>
                      <br />
                      <span style={{ color: 'var(--text3)' }}>{c.dateEnd}</span>
                    </>
                  )}
                </td>
                <td style={{ fontFamily: "'DM Mono', monospace" }}>{c.pools}</td>
                <td style={{ fontWeight: 600, color: c.isEnded || c.isDraft ? 'var(--text3)' : undefined }}>
                  {c.eligible}
                </td>
                <td
                  style={{
                    fontWeight: 600,
                    color: c.isEnded || c.isDraft ? 'var(--text3)' : 'var(--gt)',
                  }}
                >
                  {c.redeemed}
                </td>
                <td>
                  {c.isDraft ? (
                    <Button size="sm" onClick={() => openModal('create-campaign')}>
                      Edit & Activate
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateLegacy('pg-gifts-detail');
                      }}
                    >
                      {c.isEnded ? 'View' : 'Manage'}
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
