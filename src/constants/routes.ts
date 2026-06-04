/** Legacy page ids from HTML prototype → React Router paths */
export const LEGACY_PAGE_PATHS: Record<string, string> = {
  'pg-owner-dashboard': '/owner/dashboard',
  'pg-owner-settings': '/owner/settings',
  'pg-products': '/products',
  'pg-product-detail': '/products/detail',
  'pg-batch-list': '/batches',
  'pg-batch-detail': '/batches/detail',
  'pg-batch-dash': '/batch/dashboard',
  'pg-batch-settings': '/batch/settings',
  'pg-brand-dash': '/brand/dashboard',
  'pg-brand-geo': '/brand/geo',
  'pg-brand-loyalty': '/brand/loyalty',
  'pg-brand-fraud': '/brand/fraud',
  'pg-brand-settings': '/brand/settings',
  'pg-inv-dash': '/investigations/dashboard',
  'pg-inv-queue': '/investigations/queue',
  'pg-inv-detail': '/investigations/detail',
  'pg-inv-settings': '/investigations/settings',
  'pg-inv-closed': '/investigations/closed',
  'pg-gifts-list': '/gifts',
  'pg-gifts-detail': '/gifts/detail',
  'pg-gifts-analytics': '/gifts/analytics',
  'pg-notifications': '/notifications',
  'pg-reports': '/reports',
};

export function legacyPageToPath(pageId: string): string {
  return LEGACY_PAGE_PATHS[pageId] ?? '/owner/dashboard';
}
