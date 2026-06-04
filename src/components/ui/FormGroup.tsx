interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function FormGroup({ label, children, hint }: FormGroupProps) {
  return (
    <div className="fg">
      <label className="fi">{label}</label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{hint}</div>
      )}
    </div>
  );
}
