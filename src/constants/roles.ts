import type { RoleConfig, RoleId } from '../types';

export const ROLES: Record<RoleId, RoleConfig> = {
  owner: {
    label: 'Account Owner',
    pill: 'OWNER',
    pillClass: 'pill-owner',
    user: 'Nnamdi Okafor',
    initials: 'NO',
    avatarBg: '#0B1640',
    defaultPath: '/owner/dashboard',
    toolbarTitle: 'Account Overview',
    toolbarSub: 'Sartor Health Co. Ltd · All modules',
    nav: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', icon: 'grid', path: '/owner/dashboard' },
          { label: 'Notifications', icon: 'alert', path: '/notifications', badge: 3 },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Products', icon: 'box', path: '/products' },
          { label: 'Batches', icon: 'layers', path: '/batches' },
        ],
      },
      {
        title: 'Gift Engine',
        items: [
          { label: 'Campaigns', icon: 'gift', path: '/gifts' },
          { label: 'Analytics', icon: 'chart2', path: '/gifts/analytics' },
        ],
      },
      {
        title: 'Analytics',
        items: [
          { label: 'Brand Dashboard', icon: 'chart', path: '/brand/dashboard' },
          { label: 'Consumer Loyalty', icon: 'gift', path: '/brand/loyalty' },
          { label: 'Fraud Alerts', icon: 'alert', path: '/brand/fraud', badge: 3 },
          { label: 'Reports', icon: 'chart2', path: '/reports' },
        ],
      },
      {
        title: 'Investigations',
        items: [
          { label: 'Investigation Queue', icon: 'search', path: '/investigations/queue', badge: 4 },
          { label: 'Closed Cases', icon: 'check', path: '/investigations/closed' },
        ],
      },
      {
        title: 'Account',
        items: [{ label: 'Settings', icon: 'settings', path: '/owner/settings' }],
      },
    ],
  },
  batch: {
    label: 'Batch Admin',
    pill: 'BATCH ADMIN',
    pillClass: 'pill-batch',
    user: 'Sarah Adeyemi',
    initials: 'SA',
    avatarBg: '#1A2D7C',
    defaultPath: '/batch/dashboard',
    toolbarTitle: 'Dashboard',
    toolbarSub: 'Sartor Health Co. Ltd · Batch operations',
    nav: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', icon: 'grid', path: '/batch/dashboard' },
          { label: 'Alerts', icon: 'alert', path: '/batch/dashboard', badge: 2 },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Products', icon: 'box', path: '/products' },
          { label: 'Batches', icon: 'layers', path: '/batches' },
        ],
      },
      {
        title: 'Gift Engine',
        items: [
          { label: 'Campaigns', icon: 'gift', path: '/gifts' },
          { label: 'Redemptions', icon: 'check', path: '/gifts/detail' },
        ],
      },
      {
        title: 'Account',
        items: [{ label: 'Settings', icon: 'settings', path: '/batch/settings' }],
      },
    ],
  },
  brand: {
    label: 'Brand Manager',
    pill: 'BRAND MGR',
    pillClass: 'pill-brand',
    user: 'Adaeze Okonkwo',
    initials: 'AO',
    avatarBg: '#0D7A4E',
    defaultPath: '/brand/dashboard',
    toolbarTitle: 'Brand Dashboard',
    toolbarSub: 'Sartor Health Co. Ltd · Analytics',
    nav: [
      {
        title: 'Overview',
        items: [{ label: 'Dashboard', icon: 'chart', path: '/brand/dashboard' }],
      },
      {
        title: 'Gift Engine',
        items: [
          { label: 'Campaigns', icon: 'gift', path: '/gifts' },
          { label: 'Redemptions', icon: 'check', path: '/gifts/detail' },
        ],
      },
      {
        title: 'Analytics',
        items: [
          { label: 'Products', icon: 'box', path: '/products' },
          { label: 'Geographic Heat Map', icon: 'map', path: '/brand/geo' },
          { label: 'Consumer Loyalty', icon: 'gift', path: '/brand/loyalty' },
          { label: 'Fraud Alerts', icon: 'alert', path: '/brand/fraud', badge: 3 },
          { label: 'Reports', icon: 'chart2', path: '/reports' },
        ],
      },
      {
        title: 'Account',
        items: [{ label: 'Settings', icon: 'settings', path: '/brand/settings' }],
      },
    ],
  },
  inv: {
    label: 'Investigation Officer',
    pill: 'INV. OFFICER',
    pillClass: 'pill-inv',
    user: 'Emeka Okafor',
    initials: 'EO',
    avatarBg: '#925B00',
    defaultPath: '/investigations/dashboard',
    toolbarTitle: 'Investigation Dashboard',
    toolbarSub: 'Sartor Health Co. Ltd',
    nav: [
      {
        title: 'Overview',
        items: [{ label: 'Dashboard', icon: 'grid', path: '/investigations/dashboard' }],
      },
      {
        title: 'Investigations',
        items: [
          { label: 'Investigation Queue', icon: 'search', path: '/investigations/queue', badge: 4 },
          { label: 'Closed Cases', icon: 'check', path: '/investigations/closed' },
          { label: 'Fraud Patterns', icon: 'alert', path: '/investigations/dashboard' },
        ],
      },
      {
        title: 'Account',
        items: [{ label: 'Settings', icon: 'settings', path: '/investigations/settings' }],
      },
    ],
  },
};

export const CHART_LABELS = Array.from({ length: 14 }, (_, i) => `Apr ${i + 1}`);
export const CHART_DATA = [
  310, 380, 420, 290, 510, 440, 380, 520, 490, 560, 610, 580, 640, 710,
];
