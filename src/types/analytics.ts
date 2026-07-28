export interface AnalyticsKpis {
  totalProducts: number;
  activeBatches: number;
  batchesPendingDora: number;
  totalPins: number;
  verifiedPins: number;
  totalScans: number;
  authRate: number | null;
  fraudAlerts: number;
  activeConsumers: number;
  pointsIssued: number;
  smsCredits: number;
  pinCredits: number;
}

export interface AnalyticsOverview {
  days: number;
  kpis: AnalyticsKpis;
  scanTrend: { date: string; count: number }[];
  resultBreakdown: { authentic: number; uncertain: number; warning: number };
  batchStatusBreakdown: { active: number; pendingDora: number; other: number };
  topProducts: {
    productId: string;
    name: string;
    sku: string | null;
    batches: number;
    scans: number;
    authRate: number | null;
  }[];
  actionsRequired: {
    module: string;
    issue: string;
    urgency: string;
    path: string;
  }[];
}

export interface FraudAnalytics {
  days: number;
  kpis: { activeAlerts: number; underInvestigation: number; resolved: number };
  alerts: {
    date: string;
    patternType: string;
    batchNumber: string;
    severity: string;
    pin: string;
  }[];
}

export interface LoyaltyCohortRow {
  label: string;
  key: string;
  consumers: number;
  /** M0–M5 retention %; null = month not yet elapsed */
  months: (number | null)[];
}

export interface LoyaltyEntitlementAging {
  age: string;
  gifts: number;
  share: number;
}

export interface LoyaltyAnalytics {
  days: number;
  kpis: {
    registeredConsumers?: number;
    registeredTrendPct?: number | null;
    repeatRateMonth2?: number | null;
    repeatRateCompare?: { rate: number | null; label: string } | null;
    nearNextGift?: number;
    giftsAwaitingCollection?: number;
    giftsAwaitingOver60d?: number;
    activeConsumers: number;
    newRegistrations: number;
    pointsIssued: number;
    redemptionRate: number | null;
  };
  pointsTriggers?: {
    authentications: number;
    pointsAwarded: number;
    nearNextGift: number;
  };
  entitlements?: {
    awarded: number;
    redeemed: number;
    awaiting: number;
    aging: LoyaltyEntitlementAging[];
    medianDaysToCollection: number | null;
    pendingStock: number;
  };
  cohorts?: LoyaltyCohortRow[];
  cohortNote?: string | null;
  gifts: unknown[];
  note?: string;
}

export interface GeoAnalytics {
  days: number;
  regions: GeoRegion[];
  totalScans?: number;
  note?: string;
  mapCenter?: { lat: number; lng: number };
  mapZoom?: number;
}

export interface GeoRegion {
  state: string;
  scans: number;
  auths: number;
  authRate: number | null;
  intensity?: number;
  lat?: number;
  lng?: number;
}

export interface BatchAnalytics {
  batchId: string;
  batchNumber: string;
  productName: string | null;
  quantity: number;
  pinsGenerated: number;
  verifiedPins: number;
  scans: number;
  auths: number;
  authRate: number | null;
  hasDoraImages: boolean;
  scanTrend: { date: string; count: number }[];
}
