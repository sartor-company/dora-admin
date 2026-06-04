import { Badge } from './Badge';

interface HealthRowProps {
  dotColor: string;
  label: string;
  value: string;
  badge: string;
  badgeVariant?: 'bg' | 'ba' | 'br';
}

export function HealthRow({
  dotColor,
  label,
  value,
  badge,
  badgeVariant = 'bg',
}: HealthRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--bg2)',
      }}
    >
      <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: dotColor,
            display: 'inline-block',
          }}
        />
        {label}
      </span>
      <div style={{ display: 'flex', gap: 5 }}>
        <span
          style={{
            fontWeight: 600,
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
          }}
        >
          {value}
        </span>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
    </div>
  );
}
