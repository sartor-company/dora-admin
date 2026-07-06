import { useEffect, useState } from 'react';
import { investigationsApi } from '../../api/investigations';
import { analyticsApi } from '../../api/analytics';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { useToast } from '../../context/ToastContext';
import type { FraudAnalytics } from '../../types/analytics';
import { formatApiDate } from '../../utils/mappers';

export function BrandFraudPage() {
  const { isReadOnly } = useApp();
  const { refreshInvestigations } = useTenantData();
  const { showToast } = useToast();
  const [fraud, setFraud] = useState<FraudAnalytics | null>(null);

  useEffect(() => {
    analyticsApi.fraud(30).then(setFraud).catch(() => setFraud(null));
  }, []);

  const escalate = async (batchNumber: string, patternType: string) => {
    if (isReadOnly) return;
    try {
      await investigationsApi.create({
        batch: batchNumber,
        severity: patternType.includes('HIGH_RISK') || patternType.includes('BATCH_MISMATCH') ? 'P1' : 'P2',
        description: `Escalated from fraud alerts: ${patternType} on batch ${batchNumber}`,
      });
      await refreshInvestigations();
      showToast('Investigation opened from fraud alert.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not open investigation.');
    }
  };

  return (
    <>
      <PageHeader title="Fraud Alerts" subtitle="Active fraud pattern detections — powered by DORA AI" />

      {isReadOnly ? (
        <RestrictBanner>
          🔒 Investigation details managed by your Investigation Officer. This view shows alert summaries only.
        </RestrictBanner>
      ) : null}

      <KCardGrid columns={3}>
        <KCard label="Active Alerts" value={String(fraud?.kpis.activeAlerts ?? 0)} style={{ borderLeft: '3px solid var(--red)' }} trend={undefined} />
        <KCard label="Critical" value={String(fraud?.kpis.underInvestigation ?? 0)} style={{ borderLeft: '3px solid var(--amber)' }} trend={undefined} />
        <KCard label="Resolved (30d)" value={String(fraud?.kpis.resolved ?? 0)} style={{ borderLeft: '3px solid var(--green)' }} trend={undefined} />
      </KCardGrid>

      <Card>
        <TableWrap minWidth={720}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pattern Type</th>
                <th>Affected Batch</th>
                <th>Severity</th>
                {!isReadOnly && <th></th>}
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
                  {!isReadOnly && (
                    <td>
                      <Button size="sm" variant="secondary" onClick={() => escalate(row.batchNumber, row.patternType)}>
                        Investigate
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {(fraud?.alerts ?? []).length === 0 && (
                <tr>
                  <td colSpan={isReadOnly ? 4 : 5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>
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
