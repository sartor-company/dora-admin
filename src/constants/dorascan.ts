/** DORASCAN consumer verification (v4.5.1 prototype) */
export const DORASCAN_VERIFY_BASE = 'https://verify.dorascan.ai';

export const DEFAULT_VERIFY_DOMAIN = 'verify.dorascan.ai';

export function consumerVerifyUrl(clientCode?: string, orderToken = '{order_token}') {
  if (clientCode) {
    return `${DORASCAN_VERIFY_BASE}/${clientCode}/${orderToken}`;
  }
  return `${DORASCAN_VERIFY_BASE}/o/${orderToken}`;
}

export function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || 'SC').toUpperCase();
}
