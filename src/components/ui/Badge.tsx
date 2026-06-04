import type { BadgeVariant } from '../../types';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ variant = 'bg', children, className = '', style }: BadgeProps) {
  return (
    <span className={`badge ${variant} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
}
