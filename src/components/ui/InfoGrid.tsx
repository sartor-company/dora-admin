interface InfoGridProps {
  cols?: 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export function InfoGrid({ cols = 3, children, className = '' }: InfoGridProps) {
  return (
    <div className={`info-grid info-grid--${cols} ${className}`.trim()}>{children}</div>
  );
}

export function InfoCell({
  label,
  value,
  mono,
  valueStyle,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div>
      <div className="info-grid__label">{label}</div>
      <div
        className="info-grid__value"
        style={{
          ...(mono ? { fontFamily: "'DM Mono', monospace" } : {}),
          ...valueStyle,
        }}
      >
        {value}
      </div>
    </div>
  );
}
