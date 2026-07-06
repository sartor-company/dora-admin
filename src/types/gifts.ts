import type { BadgeVariant } from './index';

export type CampaignScope = 'CLIENT_WIDE' | 'SKU_SPECIFIC';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
export type GiftTrigger = 'FIRST_AUTH' | 'NTH_AUTH' | 'TOP_SCANNER';

export interface CampaignListItem {
  _id: string;
  name: string;
  subtitle: string;
  scope: CampaignScope;
  status: string;
  statusRaw: CampaignStatus;
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

export interface CampaignSummary {
  activeCampaigns: number;
  scopeBreakdown: string;
  eligibilityEvents: number;
  codesGenerated: number;
  redemptionRate: number;
  fulfilRate: number;
  pendingStock: number;
}

export interface GiftPoolGift {
  _id: string;
  icon: string;
  name: string;
  description: string;
  remaining: number;
  issued: number;
  weight: string;
  remainingColor?: string;
  showReplenish?: boolean;
  totalQty: number;
  redeemed: number;
  isActive: boolean;
}

export interface GiftPool {
  _id: string;
  trigger: GiftTrigger;
  name: string;
  subtitle: string;
  headerBg: string;
  triggerBg: string;
  triggerColor: string;
  activeLabel: string;
  activeLabelColor: string;
  isActive: boolean;
  gifts: GiftPoolGift[];
}

export interface CampaignDetail {
  _id: string;
  name: string;
  description: string;
  scope: CampaignScope;
  productIds: string[];
  status: CampaignStatus;
  statusLabel: string;
  statusVariant: BadgeVariant;
  startDate: number;
  endDate: number | null;
  dateStart: string;
  dateEnd: string | null;
  pools: string;
  stats: {
    eligible: number;
    redeemed: number;
    expired: number;
    pendingStock: number;
    redemptionRate: number;
  };
  poolsDetail: GiftPool[];
}

export interface GiftRedemption {
  _id: string;
  consumer: string;
  gift: string;
  pool: string;
  poolVariant: BadgeVariant;
  rep: string;
  method: string;
  redeemedAt: string;
  status: string;
  statusVariant: BadgeVariant;
  statusRaw: string;
}

export interface CreatePoolGiftInput {
  name: string;
  description?: string;
  totalQty: number;
  weight?: number;
}

export interface CreatePoolInput {
  name: string;
  trigger: GiftTrigger;
  triggerConfig?: {
    nthValue?: number;
    leaderboardPeriod?: 'CALENDAR_MONTH' | 'CAMPAIGN_PERIOD';
    winnerCount?: number;
  };
  gifts: CreatePoolGiftInput[];
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  scope: CampaignScope;
  productIds?: string[];
  status: 'DRAFT' | 'ACTIVE';
  startDate: string | number;
  endDate?: string | number | null;
  pools?: CreatePoolInput[];
}

export interface GiftAnalyticsOverview {
  kpis: {
    eligibilityEvents: number;
    codesGenerated: number;
    redemptionRate: number;
    fulfilRate: number;
    pendingStock: number;
  };
  chart: { labels: string[]; data: number[] };
}

export interface GiftTriggerBreakdown {
  trigger: GiftTrigger;
  events: number;
  redeemed: number;
  pendingStock: number;
  rate: number;
}

export interface GiftCampaignComparison {
  _id: string;
  name: string;
  scope: CampaignScope;
  status: string;
  events: number;
  redeemed: number;
  rate: number;
  clickable: boolean;
}

export interface CampaignAnalytics {
  kpis: {
    eligible: number;
    redeemed: number;
    expired: number;
    pendingStock: number;
    redemptionRate: number;
  };
  chart: { labels: string[]; data: number[] };
  poolBreakdown: Array<{
    pool: string;
    trigger: GiftTrigger;
    triggerVariant: BadgeVariant;
    events: number;
    codes: number;
    redeemed: number;
    rate: string;
    pending: number;
  }>;
  topReps: Array<{ rep: string; role: string; count: number }>;
}
