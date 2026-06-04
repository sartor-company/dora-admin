import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { TableWrap } from '../../components/ui/TableWrap';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';

export function BrandGeoPage() {
  return (
    <>
      <PageHeader
        title="Geographic Heat Map"
        subtitle="Warning rate by city — Nigeria-first"
      />

      <KCardGrid columns={3}>
        <KCard label="Lagos" value="7,241" trend="Auth rate 97.8%" trendType="up" />
        <KCard label="Abuja" value="3,840" trend="Auth rate 98.2%" trendType="up" />
        <KCard label="Port Harcourt" value="1,760" trend="Auth rate 94.1%" trendType="neu" />
      </KCardGrid>

      <Card>
        <CardHeader title="Warning rate hotspots" />
        <TableWrap minWidth={600}>
        <table>
          <thead>
            <tr>
              <th>City</th>
              <th>State</th>
              <th>Scans</th>
              <th>Warnings</th>
              <th>Warning Rate</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {[
              { city: 'Aba', state: 'Abia', scans: 387, warnings: 31, rate: '8.0%', rateColor: 'var(--rt)', severity: 'Critical', variant: 'br' as const },
              { city: 'Kano', state: 'Kano', scans: 512, warnings: 29, rate: '5.7%', rateColor: 'var(--at)', severity: 'High', variant: 'ba' as const },
              { city: 'Onitsha', state: 'Anambra', scans: 298, warnings: 14, rate: '4.7%', rateColor: 'var(--at)', severity: 'Medium', variant: 'ba' as const },
              { city: 'Lagos', state: 'Lagos', scans: 7241, warnings: 86, rate: '1.2%', rateColor: 'var(--gt)', severity: 'Low', variant: 'bg' as const },
            ].map((row) => (
              <tr key={row.city}>
                <td>{row.city}</td>
                <td>{row.state}</td>
                <td>{row.scans.toLocaleString()}</td>
                <td>{row.warnings}</td>
                <td style={{ fontWeight: 600, color: row.rateColor }}>{row.rate}</td>
                <td>
                  <Badge variant={row.variant}>{row.severity}</Badge>
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
