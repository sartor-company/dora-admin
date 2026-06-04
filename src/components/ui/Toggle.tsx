interface ToggleProps {
  defaultOn?: boolean;
}

export function Toggle({ defaultOn = false }: ToggleProps) {
  return (
    <button
      type="button"
      className={`toggle ${defaultOn ? 'on' : ''}`}
      onClick={(e) => e.currentTarget.classList.toggle('on')}
      aria-pressed={defaultOn}
    />
  );
}
