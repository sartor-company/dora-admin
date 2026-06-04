import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';

export function BrandFraudPage() {
  return (
    <>
      <PageHeader
        title="Fraud Alerts"
        subtitle="Active fraud pattern detections — powered by DORA AI"
      />

      <RestrictBanner>
        🔒 Investigation details managed by your Investigation Officer. This view shows alert
        summaries only.
      </RestrictBanner>

      <KCardGrid columns={3}>
        <KCard
          label="Active Alerts"
          value="3"
          style={{ borderLeft: '3px solid var(--red)' }}
          trend={undefined}
        />
        <KCard
          label="Under Investigation"
          value="1"
          style={{ borderLeft: '3px solid var(--amber)' }}
          trend={undefined}
        />
        <KCard
          label="Resolved (30d)"
          value="8"
          style={{ borderLeft: '3px solid var(--green)' }}
          trend={undefined}
        />
      </KCardGrid>

      <Card>
        <TableWrap minWidth={640}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Pattern Type</th>
              <th>Affected Batch</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Apr 15', pattern: 'Bimodal Distribution', batch: 'BATCH-042', severity: 'Critical', sevVariant: 'br' as const, status: 'Under Investigation', statusVariant: 'ba' as const },
              { date: 'Apr 12', pattern: 'Lab Scan Detection', batch: 'BATCH-038', severity: 'High', sevVariant: 'ba' as const, status: 'Open', statusVariant: 'br' as const },
              { date: 'Apr 9', pattern: 'Regional Divergence', batch: 'BATCH-037', severity: 'Medium', sevVariant: 'ba' as const, status: 'Open', statusVariant: 'br' as const },
            ].map((row) => (
              <tr key={row.date + row.pattern}>
                <td>{row.date}</td>
                <td>{row.pattern}</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{row.batch}</td>
                <td>
                  <Badge variant={row.sevVariant}>{row.severity}</Badge>
                </td>
                <td>
                  <Badge variant={row.statusVariant}>{row.status}</Badge>
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
