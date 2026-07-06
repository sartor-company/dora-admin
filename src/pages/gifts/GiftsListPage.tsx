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
import { useTenantData } from '../../context/TenantDataContext';
import { useToast } from '../../context/ToastContext';
import { useTableFilter } from '../../hooks/useTableFilter';
import type { CampaignListItem } from '../../types/gifts';

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
  const { isReadOnly, navigateTo } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { campaigns, campaignSummary, loading } = useTenantData();
  const { query, setQuery, filtered } = useTableFilter(campaigns, [
    'name',
    'subtitle',
    'status',
  ] as (keyof CampaignListItem)[]);

  const summary = campaignSummary;

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
        <KCard
          label="Active Campaigns"
          value={String(summary?.activeCampaigns ?? 0)}
          trend={summary?.scopeBreakdown || '—'}
          trendType="up"
        />
        <KCard
          label="Total Eligibility Events"
          value={String(summary?.eligibilityEvents ?? 0)}
          trend="Live from redemptions"
          trendType="up"
        />
        <KCard
          label="Codes Generated"
          value={String(summary?.codesGenerated ?? 0)}
          trend={`${summary?.fulfilRate ?? 0}% fulfil rate`}
          trendType="neu"
        />
        <KCard
          label="Redemption Rate"
          value={`${summary?.redemptionRate ?? 0}%`}
          trend={summary?.pendingStock ? `${summary.pendingStock} pending stock` : '—'}
          trendType="up"
        />
      </KCardGrid>

      <Card>
        <FilterBar>
          <input
            className="inp"
            placeholder="Search campaigns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FilterBar>
        {loading && campaigns.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text3)' }}>Loading campaigns…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text3)' }}>
            No campaigns yet. Create your first gift campaign to get started.
          </div>
        ) : (
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
                {filtered.map((c) => {
                  const row = c as CampaignListItem;
                  return (
                  <tr
                    key={row._id}
                    className={!row.isDraft && !row.isEnded ? 'cl' : undefined}
                    onClick={() =>
                      !row.isDraft && navigateTo(`/gifts/detail?id=${row._id}`)
                    }
                  >
                    <td>
                      <strong>{row.name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{row.subtitle}</div>
                    </td>
                    <td>
                      <ScopeBadge scope={row.scope} />
                    </td>
                    <td>
                      <Badge variant={row.statusVariant}>{row.status}</Badge>
                    </td>
                    <td style={{ fontSize: 12, color: row.isEnded ? 'var(--text3)' : undefined }}>
                      {row.dateStart}
                      {row.dateEnd && (
                        <>
                          <br />
                          <span style={{ color: 'var(--text3)' }}>{row.dateEnd}</span>
                        </>
                      )}
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace" }}>{row.pools}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: row.isEnded || row.isDraft ? 'var(--text3)' : undefined,
                      }}
                    >
                      {row.eligible}
                    </td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: row.isEnded || row.isDraft ? 'var(--text3)' : 'var(--gt)',
                      }}
                    >
                      {row.redeemed}
                    </td>
                    <td>
                      {row.isDraft ? (
                        <Button size="sm" onClick={() => openModal('create-campaign')}>
                          Edit & Activate
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo(`/gifts/detail?id=${row._id}`);
                          }}
                        >
                          {row.isEnded ? 'View' : 'Manage'}
                        </Button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
