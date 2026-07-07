interface ChoiceCardProps {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}

export function ChoiceCard({ selected, title, description, onClick }: ChoiceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        border: selected ? '2px solid var(--navy)' : '1px solid var(--border)',
        background: selected ? 'var(--bb)' : '#fff',
        borderRadius: 8,
        padding: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: selected ? 'var(--bt)' : undefined, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{description}</div>
    </div>
  );
}
