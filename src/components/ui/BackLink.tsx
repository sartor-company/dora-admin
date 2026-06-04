interface BackLinkProps {
  children: React.ReactNode;
  onClick: () => void;
}

export function BackLink({ children, onClick }: BackLinkProps) {
  return (
    <button type="button" className="back" onClick={onClick}>
      {children}
    </button>
  );
}
