type Trend = 'up' | 'dn' | 'neu';

interface KCardProps {
  label: string;
  value: string;
  trend?: string;
  trendType?: Trend;
  accent?: boolean;
  valueColor?: string;
  style?: React.CSSProperties;
}

export function KCard({ label, value, trend, trendType = 'neu', accent, valueColor, style }: KCardProps) {
  return (
    <div className={accent ? 'kcard kcard-accent' : 'kcard'} style={style}>
      <div className="klbl">{label}</div>
      <div className="kval" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      {trend && <div className={`ktrend ${trendType}`}>{trend}</div>}
    </div>
  );
}

interface KCardGridProps {
  columns?: 3 | 4;
  children: React.ReactNode;
}

export function KCardGrid({ columns = 4, children }: KCardGridProps) {
  return <div className={columns === 3 ? 'kgrid3' : 'kgrid'}>{children}</div>;
}
