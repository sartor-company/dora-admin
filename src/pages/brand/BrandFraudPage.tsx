import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import type { FraudAnalytics } from '../../types/analytics';
import { formatApiDate } from '../../utils/mappers';

export function BrandFraudPage() {
  const [fraud, setFraud] = useState<FraudAnalytics | null>(null);

  useEffect(() => {
    analyticsApi.fraud(30).then(setFraud).catch(() => setFraud(null));
  }, []);

  return (
    <>
      <PageHeader title="Fraud Alerts" subtitle="Active fraud pattern detections — powered by DORA AI" />

      <RestrictBanner>
        🔒 Investigation details managed by your Investigation Officer. This view shows alert summaries only.
      </RestrictBanner>

      <KCardGrid columns={3}>
        <KCard label="Active Alerts" value={String(fraud?.kpis.activeAlerts ?? 0)} style={{ borderLeft: '3px solid var(--red)' }} trend={undefined} />
        <KCard label="Critical" value={String(fraud?.kpis.underInvestigation ?? 0)} style={{ borderLeft: '3px solid var(--amber)' }} trend={undefined} />
        <KCard label="Resolved (30d)" value={String(fraud?.kpis.resolved ?? 0)} style={{ borderLeft: '3px solid var(--green)' }} trend={undefined} />
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
              </tr>
            </thead>
            <tbody>
              {(fraud?.alerts ?? []).map((row, i) => (
                <tr key={`${row.pin}-${i}`}>
                  <td>{formatApiDate(row.date ? new Date(row.date).getTime() : undefined)}</td>
                  <td>{row.patternType}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{row.batchNumber}</td>
                  <td>
                    <Badge variant={row.severity === 'Critical' ? 'br' : 'ba'}>{row.severity}</Badge>
                  </td>
                </tr>
              ))}
              {(fraud?.alerts ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>
                    No fraud alerts in the last 30 days.
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
