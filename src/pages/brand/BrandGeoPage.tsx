import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import type { GeoAnalytics } from '../../types/analytics';

export function BrandGeoPage() {
  const [geo, setGeo] = useState<GeoAnalytics | null>(null);

  useEffect(() => {
    analyticsApi.geo(30).then(setGeo).catch(() => setGeo(null));
  }, []);

  return (
    <>
      <PageHeader title="Geographic Heat Map" subtitle="Warning rate by city — Nigeria-first" />

      <Card>
        <CardHeader title="Regional scan data" />
        {geo?.regions && geo.regions.length > 0 ? (
          <div style={{ padding: 16 }}>Regional data table coming soon.</div>
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            {geo?.note || 'Geographic data will appear when location capture is enabled on consumer verification.'}
          </div>
        )}
      </Card>
    </>
  );
}
