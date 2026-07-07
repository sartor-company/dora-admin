interface ToggleProps {
  on?: boolean;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}

export function Toggle({ on, defaultOn = false, onChange }: ToggleProps) {
  const active = on ?? defaultOn;

  return (
    <button
      type="button"
      className={`toggle ${active ? 'on' : ''}`}
      onClick={() => onChange?.(!active)}
      aria-pressed={active}
    />
  );
}
