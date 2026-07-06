import { useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoRegion } from '../../types/analytics';

/** Approximate state centroids for Nigeria when lat/lng missing on records */
const NG_STATE_COORDS: Record<string, [number, number]> = {
  Lagos: [6.5244, 3.3792],
  Abuja: [9.0765, 7.3986],
  FCT: [9.0765, 7.3986],
  Kano: [12.0022, 8.592],
  Rivers: [4.8156, 7.0498],
  Oyo: [7.3775, 3.947],
  Kaduna: [10.5105, 7.4165],
  Enugu: [6.5244, 7.5086],
  Delta: [5.532, 5.898],
  Ogun: [6.998, 3.4738],
  Anambra: [6.2209, 6.937],
  Edo: [6.335, 5.6037],
  Plateau: [9.8965, 8.8583],
  Borno: [11.8333, 13.15],
  Imo: [5.492, 7.026],
};

function regionCoords(r: GeoRegion): [number, number] | null {
  if (r.lat != null && r.lng != null) return [r.lat, r.lng];
  const key = Object.keys(NG_STATE_COORDS).find(
    (k) => k.toLowerCase() === r.state.toLowerCase(),
  );
  return key ? NG_STATE_COORDS[key] : null;
}

interface GeoHeatMapProps {
  regions: GeoRegion[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function GeoHeatMap({ regions, center = { lat: 9.082, lng: 8.6753 }, zoom = 6 }: GeoHeatMapProps) {
  const markers = useMemo(() => {
    const max = Math.max(...regions.map((r) => r.scans), 1);
    return regions
      .map((r) => {
        const pos = regionCoords(r);
        if (!pos) return null;
        const radius = 8 + (r.scans / max) * 22;
        const fill =
          (r.authRate ?? 100) < 70 ? '#C0392B' : (r.authRate ?? 100) < 90 ? '#E67E22' : '#0D7A4E';
        return { ...r, pos, radius, fill };
      })
      .filter(Boolean) as (GeoRegion & { pos: [number, number]; radius: number; fill: string })[];
  }, [regions]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: 420, width: '100%', borderRadius: 8 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <CircleMarker
          key={m.state}
          center={m.pos}
          radius={m.radius}
          pathOptions={{ color: m.fill, fillColor: m.fill, fillOpacity: 0.55, weight: 1 }}
        >
          <Popup>
            <strong>{m.state}</strong>
            <br />
            Scans: {m.scans.toLocaleString()}
            <br />
            Auth rate: {m.authRate != null ? `${m.authRate}%` : '—'}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
