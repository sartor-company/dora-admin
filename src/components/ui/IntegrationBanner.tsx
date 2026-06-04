type IntegrationVariant = 'crm' | 'dora';

interface IntegrationBannerProps {
  variant: IntegrationVariant;
  label: string;
  description: string;
  href: string;
  linkText: string;
}

export function IntegrationBanner({
  variant,
  label,
  description,
  href,
  linkText,
}: IntegrationBannerProps) {
  return (
    <div className={`int-banner int-${variant}`}>
      {variant === 'crm' ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--navy)">
          <path d="M10 1h5v5M6 10L15 1M3 4H1v11h11v-2" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--gt)">
          <circle cx="8" cy="8" r="3" />
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
      <div style={{ flex: 1 }}>
        <span className="int-label" style={variant === 'dora' ? { color: 'var(--gt)' } : undefined}>
          {label}
        </span>
        {' — '}
        <span style={{ color: variant === 'dora' ? 'var(--gt)' : 'var(--text2)' }}>
          {description}
        </span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`int-link ${variant}`}
      >
        {linkText}
      </a>
    </div>
  );
}
