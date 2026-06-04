interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return <div className={`filter-row ${className}`.trim()}>{children}</div>;
}
