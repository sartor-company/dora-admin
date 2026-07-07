import type { ApiProduct } from '../types/api';

export interface ProductLicenceRow {
  id: string;
  authority: string;
  number: string;
  country: string;
  market: string;
  validFrom: string;
  validTo: string;
}

/** Demo licences until product licence API exists */
export function demoLicencesForProduct(product: ApiProduct): ProductLicenceRow[] {
  const name = product.productName?.toLowerCase() || '';
  if (!name.includes('sanit') && !name.includes('pharma') && !name.includes('health')) {
    return [];
  }
  return [
    {
      id: 'lic-1',
      authority: 'NAFDAC',
      number: 'A7-0423L',
      country: 'Nigeria',
      market: 'Nigeria',
      validFrom: '2024-01-01',
      validTo: '2026-12-31',
    },
    {
      id: 'lic-2',
      authority: 'SON',
      number: 'SON/RM/2023/0117',
      country: 'Nigeria',
      market: 'Nigeria',
      validFrom: '2023-03-01',
      validTo: '2027-02-28',
    },
  ];
}

export function formatLicenceDate(value: string | number): string {
  const d = typeof value === 'number' ? new Date(value) : new Date(value);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function licenceStatus(validTo: string | number): 'Active' | 'Expired' | 'Expiring soon' {
  const end = typeof validTo === 'number' ? validTo : new Date(validTo).getTime();
  const now = Date.now();
  const days = (end - now) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'Expired';
  if (days < 60) return 'Expiring soon';
  return 'Active';
}
