import type { BadgeVariant } from '../types';

export interface Product {
  id: string;
  name: string;
  sku: string;
  codeType: 'GS1' | 'SC Code';
  category: string;
  batches: number;
  scans: number;
  authRate: number;
  doraStatus: string;
  doraVariant: BadgeVariant;
  authRateColor?: string;
  [key: string]: string | number | BadgeVariant | undefined;
}

export interface Batch {
  id: string;
  product: string;
  productId?: string;
  created: string;
  qty: number;
  status: string;
  statusVariant: BadgeVariant;
  auths: string;
  scans: string;
  delivery: string;
  deliveryVariant: BadgeVariant;
  dora: string;
  doraVariant: BadgeVariant;
  needsUpload?: boolean;
  [key: string]: string | number | boolean | BadgeVariant | undefined;
}

export interface Campaign {
  id: string;
  name: string;
  subtitle: string;
  scope: 'CLIENT_WIDE' | 'SKU_SPECIFIC';
  status: string;
  statusVariant: BadgeVariant;
  dateStart: string;
  dateEnd: string;
  pools: string;
  eligible: string;
  redeemed: string;
  isDraft?: boolean;
  isEnded?: boolean;
  [key: string]: string | boolean | BadgeVariant | undefined;
}

export interface Investigation {
  id: string;
  displayId?: string;
  priority: string;
  priorityColor: string;
  flag: string;
  flagVariant: BadgeVariant;
  batch: string;
  product: string;
  dora: number;
  status: string;
  statusVariant: BadgeVariant;
  location: string;
  outcome?: string;
  outcomeVariant?: BadgeVariant;
  closed?: string;
  officer?: string;
  [key: string]: string | number | BadgeVariant | undefined;
}

export type NotificationType = 'alert' | 'training' | 'gift' | 'billing';

export interface Notification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  body: string;
  time: string;
  action?: { label: string; pageId: string };
  read?: boolean;
  bg: string;
  borderColor: string;
  titleColor: string;
  bodyColor: string;
  timeColor: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleVariant: BadgeVariant;
  status: string;
  statusVariant: BadgeVariant;
  invited?: boolean;
}

export interface TeamActivity {
  name: string;
  role: string;
  action: string;
  alert?: boolean;
}

export interface ActionRequired {
  module: string;
  issue: string;
  urgency: string;
  urgencyVariant: BadgeVariant;
  actionLabel: string;
  pageId: string;
  role?: string;
  variant?: 'danger' | 'secondary';
}

export interface GiftPool {
  id: string;
  trigger: 'FIRST_AUTH' | 'NTH_AUTH' | 'TOP_SCANNER';
  name: string;
  subtitle: string;
  headerBg: string;
  triggerBg: string;
  triggerColor: string;
  activeLabel: string;
  activeLabelColor: string;
  gifts: GiftItem[];
}

export interface GiftItem {
  icon: string;
  name: string;
  description: string;
  remaining: number;
  issued: number;
  weight: string;
  remainingColor?: string;
  showReplenish?: boolean;
}

export interface Redemption {
  consumer: string;
  gift: string;
  pool: string;
  poolVariant: BadgeVariant;
  rep: string;
  method: string;
  redeemedAt: string;
  status: string;
  statusVariant: BadgeVariant;
}

export interface DoraFeature {
  label: string;
  score: number;
  color: string;
  textColor: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Sartor Hand Sanitiser 500ml',
    sku: 'SHS-001',
    codeType: 'GS1',
    category: 'Personal Care',
    batches: 12,
    scans: 4880,
    authRate: 97.2,
    doraStatus: 'Active',
    doraVariant: 'bg',
  },
  {
    id: '2',
    name: 'Carabiner Holder Pack',
    sku: 'CHP-002',
    codeType: 'GS1',
    category: 'Accessories',
    batches: 8,
    scans: 2457,
    authRate: 98.1,
    doraStatus: 'Active',
    doraVariant: 'bg',
  },
  {
    id: '3',
    name: 'Silicone Holder/Hook Pack',
    sku: 'SHP-003',
    codeType: 'SC Code',
    category: 'Accessories',
    batches: 6,
    scans: 1892,
    authRate: 96.8,
    doraStatus: 'Active',
    doraVariant: 'bg',
  },
  {
    id: '4',
    name: 'Sartor Hand Sanitiser 250ml',
    sku: 'SHS-004',
    codeType: 'SC Code',
    category: 'Personal Care',
    batches: 5,
    scans: 980,
    authRate: 91.2,
    doraStatus: 'Pending',
    doraVariant: 'ba',
    authRateColor: 'var(--at)',
  },
];

export const batches: Batch[] = [
  {
    id: 'BATCH-042',
    product: 'Sanitiser 500ml',
    created: 'Apr 1',
    qty: 600,
    status: 'Active',
    statusVariant: 'bg',
    auths: '234',
    scans: '567',
    delivery: '18/25 delivered',
    deliveryVariant: 'bg',
    dora: 'Ready',
    doraVariant: 'bg',
  },
  {
    id: 'BATCH-041',
    product: 'Carabiner Holder',
    created: 'Mar 28',
    qty: 400,
    status: 'Pending Model',
    statusVariant: 'ba',
    auths: '—',
    scans: '—',
    delivery: 'Not despatched',
    deliveryVariant: 'bx',
    dora: '⚠ Image needed',
    doraVariant: 'ba',
    needsUpload: true,
  },
  {
    id: 'BATCH-040',
    product: 'Sanitiser 250ml',
    created: 'Mar 25',
    qty: 500,
    status: 'Training',
    statusVariant: 'bp',
    auths: '—',
    scans: '—',
    delivery: 'Not despatched',
    deliveryVariant: 'bx',
    dora: 'Training',
    doraVariant: 'bp',
  },
  {
    id: 'BATCH-037',
    product: 'Silicone Hook Pack',
    created: 'Mar 18',
    qty: 450,
    status: 'Active',
    statusVariant: 'bg',
    auths: '302',
    scans: '634',
    delivery: 'All delivered',
    deliveryVariant: 'bg',
    dora: 'Ready',
    doraVariant: 'bg',
  },
];

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Welcome & Loyalty — Default',
    subtitle: 'Sartor Health brand-wide milestone programme',
    scope: 'CLIENT_WIDE',
    status: 'Active',
    statusVariant: 'bg',
    dateStart: 'Jan 1, 2026',
    dateEnd: 'No end date',
    pools: '3/3',
    eligible: '892',
    redeemed: '645',
  },
  {
    id: '2',
    name: 'Sanitiser 500ml Launch Promo',
    subtitle: 'SKU: SHS-001 · First buyer + 5th scan gift',
    scope: 'SKU_SPECIFIC',
    status: 'Active',
    statusVariant: 'bg',
    dateStart: 'Apr 1, 2026',
    dateEnd: 'Jun 30, 2026',
    pools: '2/2',
    eligible: '312',
    redeemed: '228',
  },
  {
    id: '3',
    name: 'Carabiner Bundle Reward',
    subtitle: 'SKU: CHP-002 · Top 10 monthly scanners',
    scope: 'SKU_SPECIFIC',
    status: 'Active',
    statusVariant: 'bg',
    dateStart: 'Mar 1, 2026',
    dateEnd: 'Dec 31, 2026',
    pools: '1/1',
    eligible: '80',
    redeemed: '74',
  },
  {
    id: '4',
    name: 'Q1 New Year Promo',
    subtitle: 'Brand-wide · Ended Mar 31, 2026',
    scope: 'CLIENT_WIDE',
    status: 'Ended',
    statusVariant: 'bx',
    dateStart: 'Jan–Mar 2026',
    dateEnd: '',
    pools: '2/2',
    eligible: '0',
    redeemed: '0',
    isEnded: true,
  },
  {
    id: '5',
    name: 'Silicone Pack Trial',
    subtitle: 'SKU: SHP-003 · Saved as draft',
    scope: 'SKU_SPECIFIC',
    status: 'Draft',
    statusVariant: 'bx',
    dateStart: 'Not set',
    dateEnd: '',
    pools: '1/1',
    eligible: '—',
    redeemed: '—',
    isDraft: true,
  },
];

export const investigations: Investigation[] = [
  {
    id: 'INV-087',
    displayId: 'INV-2024-087',
    priority: 'P1',
    priorityColor: 'var(--red)',
    flag: 'BATCH MISMATCH',
    flagVariant: 'br',
    batch: 'BATCH-038',
    product: 'Carabiner Holder',
    dora: 23,
    status: 'OPEN',
    statusVariant: 'br',
    location: 'Shanghai, CN',
  },
  {
    id: 'INV-086',
    priority: 'P2',
    priorityColor: 'var(--red)',
    flag: 'HI-RISK CLONED PIN',
    flagVariant: 'br',
    batch: 'BATCH-035',
    product: 'Sanitiser 500ml',
    dora: 31,
    status: 'UNDER REVIEW',
    statusVariant: 'bb',
    location: 'Aba, NG',
  },
  {
    id: 'INV-085',
    priority: 'P3',
    priorityColor: 'var(--amber)',
    flag: 'HI-RISK REJECTED',
    flagVariant: 'ba',
    batch: 'BATCH-032',
    product: 'Silicone Hook Pack',
    dora: 28,
    status: 'OPEN',
    statusVariant: 'br',
    location: 'Kano, NG',
  },
];

export const closedInvestigations: Investigation[] = [
  {
    id: 'INV-083',
    priority: 'P2',
    priorityColor: 'var(--text3)',
    flag: 'HI-RISK CLONED',
    flagVariant: 'br',
    batch: 'BATCH-029',
    product: 'Sanitiser 500ml',
    dora: 29,
    status: 'Confirmed',
    statusVariant: 'br',
    location: '',
    outcome: 'Confirmed',
    outcomeVariant: 'br',
    closed: 'Apr 10',
    officer: 'E. Okafor',
  },
  {
    id: 'INV-082',
    priority: 'P6',
    priorityColor: 'var(--text3)',
    flag: 'SUSPICIOUS',
    flagVariant: 'ba',
    batch: 'BATCH-023',
    product: 'Sanitiser 250ml',
    dora: 42,
    status: 'Cleared',
    statusVariant: 'bg',
    location: '',
    outcome: 'Cleared',
    outcomeVariant: 'bg',
    closed: 'Apr 13',
    officer: 'E. Okafor',
  },
  {
    id: 'INV-079',
    priority: 'P3',
    priorityColor: 'var(--text3)',
    flag: 'HI-RISK REJECTED',
    flagVariant: 'ba',
    batch: 'BATCH-021',
    product: 'Silicone Hook Pack',
    dora: 38,
    status: 'Cleared',
    statusVariant: 'bg',
    location: '',
    outcome: 'Cleared',
    outcomeVariant: 'bg',
    closed: 'Apr 2',
    officer: 'E. Okafor',
  },
  {
    id: 'INV-077',
    priority: 'P1',
    priorityColor: 'var(--text3)',
    flag: 'BATCH MISMATCH',
    flagVariant: 'br',
    batch: 'BATCH-019',
    product: 'Carabiner Holder',
    dora: 19,
    status: 'Confirmed',
    statusVariant: 'br',
    location: '',
    outcome: 'Confirmed',
    outcomeVariant: 'br',
    closed: 'Mar 28',
    officer: 'E. Okafor',
  },
];

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    icon: '🚨',
    title: 'P1 Investigation opened — INV-087',
    body: 'BATCH MISMATCH detected on BATCH-038 · Carabiner Holder Pack · Shanghai, CN · DORA: 23/100',
    time: 'Today, 09:14',
    action: { label: 'Review', pageId: 'pg-inv-detail' },
    bg: 'var(--rb)',
    borderColor: 'var(--red)',
    titleColor: 'var(--rt)',
    bodyColor: 'var(--rt)',
    timeColor: 'var(--rt)',
  },
  {
    id: '2',
    type: 'training',
    icon: '🤖',
    title: 'DORA model training complete — BATCH-042',
    body: 'Sartor Hand Sanitiser 500ml model is now active and authenticating. 97.2% auth rate on first 48 hours.',
    time: 'Today, 08:02',
    action: { label: 'View Batch', pageId: 'pg-batch-detail' },
    bg: 'var(--gb)',
    borderColor: 'var(--green)',
    titleColor: 'var(--gt)',
    bodyColor: 'var(--gt)',
    timeColor: 'var(--gt)',
  },
  {
    id: '3',
    type: 'billing',
    icon: '💰',
    title: 'SMS credit balance at 41% — consider topping up',
    body: '5,876 SMS credits remaining of 10,000 purchased. You will receive an alert again at 20%.',
    time: 'Yesterday, 16:30',
    action: { label: 'Buy More', pageId: 'pg-owner-settings' },
    bg: 'var(--ab)',
    borderColor: 'var(--amber)',
    titleColor: 'var(--at)',
    bodyColor: 'var(--at)',
    timeColor: 'var(--at)',
  },
  {
    id: '4',
    type: 'gift',
    icon: '🎁',
    title: 'Low stock alert — Pool 3 Premium Membership',
    body: 'Only 4 Premium Membership gifts remaining in Welcome & Loyalty campaign Pool 3. Replenish to avoid PENDING_STOCK events.',
    time: 'Apr 15, 12:00',
    action: { label: 'Replenish', pageId: 'replenish' },
    bg: 'var(--bb)',
    borderColor: 'var(--blue)',
    titleColor: 'var(--bt)',
    bodyColor: 'var(--bt)',
    timeColor: 'var(--bt)',
  },
  {
    id: '5',
    type: 'alert',
    icon: '✅',
    title: 'INV-082 cleared as false positive',
    body: 'São Paulo, BR investigation on BATCH-023 reviewed and cleared. No counterfeit activity confirmed.',
    time: 'Apr 13, 14:22',
    bg: 'var(--bg)',
    borderColor: 'var(--border)',
    titleColor: 'var(--text)',
    bodyColor: 'var(--text2)',
    timeColor: 'var(--text3)',
  },
  {
    id: '6',
    type: 'training',
    icon: '📷',
    title: 'DORA training images submitted — BATCH-041',
    body: 'Carabiner Holder Pack reference images submitted for DORA model training. Expected completion: 1–3 business days.',
    time: 'Apr 12, 10:45',
    bg: 'var(--bg)',
    borderColor: 'var(--border)',
    titleColor: 'var(--text)',
    bodyColor: 'var(--text2)',
    timeColor: 'var(--text3)',
  },
];

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Nnamdi Okafor', email: 'nnamdi@sartorhealth.com', role: 'Account Owner', roleVariant: 'bp', status: 'Active', statusVariant: 'bg' },
  { id: '2', name: 'Sarah Adeyemi', email: 'sarah@sartorhealth.com', role: 'Batch Admin', roleVariant: 'bb', status: 'Active', statusVariant: 'bg' },
  { id: '3', name: 'Adaeze Okonkwo', email: 'adaeze@sartorhealth.com', role: 'Brand Manager', roleVariant: 'bg', status: 'Active', statusVariant: 'bg' },
  { id: '4', name: 'Emeka Okafor', email: 'emeka@sartorhealth.com', role: 'Investigation Officer', roleVariant: 'ba', status: 'Active', statusVariant: 'bg' },
  { id: '5', name: 'Chisom Eze', email: 'chisom@sartorhealth.com', role: 'Brand Manager', roleVariant: 'bg', status: 'Invited', statusVariant: 'ba', invited: true },
];

export const teamActivity: TeamActivity[] = [
  { name: 'Sarah Adeyemi', role: 'Batch Admin', action: 'Created BATCH-042 · Downloaded print package' },
  { name: 'Adaeze Okonkwo', role: 'Brand Manager', action: 'Exported loyalty report · Viewed geo heatmap' },
  { name: 'Emeka Okafor', role: 'Investigation Officer', action: 'Flagged INV-087 P1 · Requested evidence bundle', alert: true },
];

export const actionsRequired: ActionRequired[] = [
  { module: 'Investigations', issue: 'INV-087 P1 open — batch mismatch', urgency: 'Critical', urgencyVariant: 'br', actionLabel: 'Review', pageId: 'pg-inv-queue', variant: 'danger' },
  { module: 'DORA Training', issue: 'BATCH-041 awaiting reference image', urgency: 'Attention', urgencyVariant: 'ba', actionLabel: 'Upload', pageId: 'pg-batch-list', variant: 'secondary' },
  { module: 'SMS Credits', issue: '41% of bundle used — top up soon', urgency: 'Monitor', urgencyVariant: 'ba', actionLabel: 'Billing', pageId: 'pg-owner-settings', role: 'owner', variant: 'secondary' },
  { module: 'PIN Credits', issue: '8,200 remaining of 10,000', urgency: 'Monitor', urgencyVariant: 'bx', actionLabel: 'Billing', pageId: 'pg-owner-settings', role: 'owner', variant: 'secondary' },
];

export const giftPools: GiftPool[] = [
  {
    id: 'pool-1',
    trigger: 'FIRST_AUTH',
    name: 'Pool 1 — Welcome Gift',
    subtitle: "Fires on consumer's 1st authentication · Exempt from stacking",
    headerBg: 'var(--gb)',
    triggerBg: 'var(--green)',
    triggerColor: '#fff',
    activeLabel: 'Pool Active',
    activeLabelColor: 'var(--gt)',
    gifts: [
      { icon: '🎁', name: 'Welcome Pack', description: 'Branded tote bag + sanitiser sample', remaining: 148, issued: 352, weight: '100%' },
    ],
  },
  {
    id: 'pool-2',
    trigger: 'NTH_AUTH',
    name: 'Pool 2 — 10th Scan Milestone',
    subtitle: "Fires on consumer's 10th authentication",
    headerBg: 'var(--bb)',
    triggerBg: 'var(--blue)',
    triggerColor: '#fff',
    activeLabel: 'Pool Active',
    activeLabelColor: 'var(--bt)',
    gifts: [
      { icon: '💳', name: '₦500 Store Credit', description: 'Digital voucher code', remaining: 210, issued: 290, weight: '60%' },
      { icon: '💼', name: 'Free Delivery Voucher', description: 'Next order free delivery', remaining: 87, issued: 213, weight: '40%' },
    ],
  },
  {
    id: 'pool-3',
    trigger: 'TOP_SCANNER',
    name: 'Pool 3 — Monthly Top 10',
    subtitle: 'Top 10 consumers by monthly auth count · CALENDAR_MONTH',
    headerBg: 'var(--ab)',
    triggerBg: 'var(--amber)',
    triggerColor: '#fff',
    activeLabel: 'Pool Active',
    activeLabelColor: 'var(--at)',
    gifts: [
      { icon: '🏋', name: 'Premium Membership (1 month)', description: 'Exclusive member benefits', remaining: 4, issued: 56, weight: '100%', remainingColor: 'var(--at)', showReplenish: true },
    ],
  },
];

export const redemptions: Redemption[] = [
  { consumer: '+234***4521', gift: '₦500 Store Credit', pool: 'NTH_AUTH', poolVariant: 'bb', rep: 'Mike O.', method: 'QR Scan', redeemedAt: 'Apr 15, 14:32', status: 'Redeemed', statusVariant: 'bg' },
  { consumer: '+234***8812', gift: 'Welcome Pack', pool: 'FIRST_AUTH', poolVariant: 'bg', rep: 'Ada C.', method: 'Manual Entry', redeemedAt: 'Apr 15, 11:20', status: 'Redeemed', statusVariant: 'bg' },
  { consumer: '+234***3301', gift: 'Free Delivery Voucher', pool: 'NTH_AUTH', poolVariant: 'bb', rep: 'Bola A.', method: 'QR Scan', redeemedAt: 'Apr 14, 16:05', status: 'Redeemed', statusVariant: 'bg' },
  { consumer: '+234***7744', gift: '₦500 Store Credit', pool: 'NTH_AUTH', poolVariant: 'bb', rep: '—', method: '—', redeemedAt: '—', status: 'Pending Stock', statusVariant: 'ba' },
  { consumer: '+234***9920', gift: 'Welcome Pack', pool: 'FIRST_AUTH', poolVariant: 'bg', rep: 'Chidi K.', method: 'QR Scan', redeemedAt: 'Apr 13, 09:18', status: 'Expired', statusVariant: 'bx' },
];

export const doraFeatures: DoraFeature[] = [
  { label: 'F1 · Histogram Quality', score: 18, color: 'var(--red)', textColor: 'var(--rt)' },
  { label: 'F2 · Text Alignment', score: 34, color: 'var(--amber)', textColor: 'var(--at)' },
  { label: 'F3 · Colour Consistency', score: 21, color: 'var(--red)', textColor: 'var(--rt)' },
  { label: 'F4 · Barcode Value', score: 18, color: 'var(--red)', textColor: 'var(--rt)' },
  { label: 'F5 · SKU Name (OCR)', score: 29, color: 'var(--amber)', textColor: 'var(--at)' },
];

export const priorityLegend = [
  { label: 'P1 — BATCH MISMATCH:', desc: "QR'd ≠ PIN batch" },
  { label: 'P2 — HI-RISK CLONED PIN:', desc: 'DORA <50 + used PIN diff user' },
  { label: 'P3 — HI-RISK REJECTED:', desc: 'DORA <50 + invalid PIN' },
  { label: 'P4 — SUSPICIOUS CLONED:', desc: 'DORA ≥70 + used PIN diff user' },
  { label: 'P5 — DUAL STAGE FAILURE:', desc: 'Both DORA signals fail' },
  { label: 'P7 — POSSIBLE TAMPERING:', desc: 'Rescan DORA <50, <30 days' },
];
