import type { CurrencyCode } from '../types';

export const CURRENCIES: Record<
  CurrencyCode,
  { sym: string; rate: number; label: string }
> = {
  NGN: { sym: '₦', rate: 1, label: 'NGN ₦' },
  GHS: { sym: '₵', rate: 0.01, label: 'GHS ₵' },
  KES: { sym: 'KSh', rate: 0.082, label: 'KES KSh' },
  ZAR: { sym: 'R', rate: 0.011, label: 'ZAR R' },
  USD: { sym: '$', rate: 0.00063, label: 'USD $' },
  GBP: { sym: '£', rate: 0.0005, label: 'GBP £' },
  EUR: { sym: '€', rate: 0.00059, label: 'EUR €' },
};

export function formatCurrencyAmount(nairaAmount: number, code: CurrencyCode): string {
  const c = CURRENCIES[code];
  const v = nairaAmount * c.rate;
  const formatted =
    v >= 1000
      ? v.toLocaleString('en', { maximumFractionDigits: 0 })
      : v.toFixed(2);
  return `${c.sym}${formatted}`;
}
