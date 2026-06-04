interface StatItem {
  label: string;
  value: string;
  valueColor?: string;
}

interface StatBannerProps {
  stats: StatItem[];
  className?: string;
}

export function StatBanner({ stats, className = '' }: StatBannerProps) {
  return (
    <div className={`stat-banner ${className}`.trim()}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="stat-banner__label">{stat.label}</div>
          <div className="stat-banner__value" style={stat.valueColor ? { color: stat.valueColor } : undefined}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
