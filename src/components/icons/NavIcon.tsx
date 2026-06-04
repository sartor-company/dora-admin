import type { NavIconKey } from '../../types';

export function NavIcon({ name }: { name: NavIconKey }) {
  switch (name) {
    case 'grid':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      );
    case 'box':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2h12v3H2V2zm0 5h12v8H2V7z" />
        </svg>
      );
    case 'layers':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1l7 4-7 4L1 5l7-4zm0 6l7 4-7 4L1 11l7-4z" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="2.5" />
          <path d="M7 1v1.5A5 5 0 002 7H1v2h1a5 5 0 005 4.5V15h2v-1.5A5 5 0 0014 9h1V7h-1a5 5 0 00-5-4.5V1H7z" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 12h2v2H2v-2zm3-4h2v6H5V8zm3-3h2v9H8V5zm3-2h2v11h-2V3z" />
        </svg>
      );
    case 'alert':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 1l7 14H1L8 1zm0 5v4m0 2v1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'gift':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="7" width="10" height="8" rx="1" />
          <rect x="2" y="4" width="12" height="4" rx="1" />
          <line x1="8" y1="4" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case 'map':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M1 2l5 2 4-2 5 2v11l-5-2-4 2-5-2V2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M2 8l4 4 8-8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    case 'chart2':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 8L8 3M8 8L12 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
