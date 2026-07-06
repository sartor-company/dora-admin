import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { GeoHeatMap } from '../../components/maps/GeoHeatMap';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap } from '../../components/ui/TableWrap';
import type { GeoAnalytics } from '../../types/analytics';

export function BrandGeoPage() {
  const [geo, setGeo] = useState<GeoAnalytics | null>(null);

  useEffect(() => {
    analyticsApi.geo(30).then(setGeo).catch(() => setGeo(null));
  }, []);

  const hasRegions = Boolean(geo?.regions?.length);

  return (
    <>
      <PageHeader title="Geographic Heat Map" subtitle="Scan volume by region — Nigeria-first" />

      <Card style={{ marginBottom: 14 }}>
        <CardHeader title="Scan map" />
        {hasRegions ? (
          <div style={{ padding: '0 16px 16px' }}>
            <GeoHeatMap
              regions={geo!.regions}
              center={geo?.mapCenter}
              zoom={geo?.mapZoom}
            />
          </div>
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            <p style={{ marginBottom: 8 }}>{geo?.note || 'No geographic data yet.'}</p>
            <p style={{ fontSize: 12, maxWidth: 520, margin: '0 auto' }}>
              Geo map is populated when consumer verifications include location (state or GPS). The verify
              flow sends optional <code>state</code>, <code>latitude</code>, and <code>longitude</code> fields
              on each authentication record — aggregate them here by region.
            </p>
          </div>
        )}
      </Card>

      {hasRegions && (
        <Card>
          <CardHeader title="Regional breakdown" />
          <TableWrap minWidth={480}>
            <table>
              <thead>
                <tr>
                  <th>State / Region</th>
                  <th>Scans</th>
                  <th>Auth rate</th>
                </tr>
              </thead>
              <tbody>
                {geo!.regions.map((r) => (
                  <tr key={r.state}>
                    <td>{r.state}</td>
                    <td>{r.scans.toLocaleString()}</td>
                    <td>{r.authRate != null ? `${r.authRate}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </Card>
      )}
    </>
  );
}
