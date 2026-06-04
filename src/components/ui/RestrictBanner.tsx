interface RestrictBannerProps {
  children: React.ReactNode;
}

export function RestrictBanner({ children }: RestrictBannerProps) {
  return <div className="restrict">{children}</div>;
}
