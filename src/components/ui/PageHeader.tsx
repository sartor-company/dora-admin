interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="pghead">
      <div>
        <div className="pgtitle">{title}</div>
        {subtitle && <div className="pgsub">{subtitle}</div>}
      </div>
      {actions ? <div className="pghead-actions">{actions}</div> : null}
    </div>
  );
}
