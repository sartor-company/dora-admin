export type RoleId = 'owner' | 'batch' | 'brand' | 'inv';

export type ClientType = 'full' | 'pilot';

export type CurrencyCode = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD' | 'GBP' | 'EUR';

export type BadgeVariant = 'bg' | 'ba' | 'br' | 'bb' | 'bp' | 'bx';

export type NavIconKey =
  | 'grid'
  | 'box'
  | 'layers'
  | 'settings'
  | 'chart'
  | 'alert'
  | 'search'
  | 'gift'
  | 'map'
  | 'check'
  | 'chart2';

export interface NavItem {
  label: string;
  icon: NavIconKey;
  path: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface RoleConfig {
  label: string;
  pill: string;
  pillClass: string;
  user: string;
  initials: string;
  avatarBg: string;
  nav: NavSection[];
  defaultPath: string;
  toolbarTitle: string;
  toolbarSub: string;
}

export type ModalId =
  | 'currency'
  | 'product'
  | 'batch'
  | 'dora'
  | 'invite-member'
  | 'edit-member'
  | 'buy-credits'
  | 'reports'
  | 'flag-batch-inv'
  | 'clear-fp'
  | 'evidence-bundle'
  | 'batch-download'
  | 'batch-pause'
  | 'batch-flag'
  | 'convert-deployment'
  | 'domain-upgrade'
  | 'create-campaign'
  | 'pause-warn'
  | 'end-warn'
  | 'replenish'
  | 'add-gift';
