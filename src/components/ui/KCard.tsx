type Trend = 'up' | 'dn' | 'neu';

interface KCardProps {
  label: string;
  value: string;
  trend?: string;
  trendType?: Trend;
  style?: React.CSSProperties;
}

export function KCard({ label, value, trend, trendType = 'neu', style }: KCardProps) {
  return (
    <div className="kcard" style={style}>
      <div className="klbl">{label}</div>
      <div className="kval">{value}</div>
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
