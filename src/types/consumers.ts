export type ConsumerStatus = 'Active' | 'Dormant' | 'Flagged';

export type ConsumerListItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  emailMasked: string;
  phoneMasked?: string;
  hasFullPhone?: boolean;
  joined: string;
  joinedAt?: number | null;
  status: ConsumerStatus;
  points: number;
  authentications: number;
  pointsToNextGift: number;
  progressToNextGift: number;
  nearNextGift: boolean;
  giftsWon: number;
  giftsRedeemed: number;
  reports: number;
  hasUnredeemedGifts: boolean;
};

export type ConsumerDirectoryKpis = {
  registeredConsumers: number;
  totalPointsIssued: number;
  giftsRedeemed: number;
  consumerReports: number;
  nearNextGift: number;
};

export type ConsumerDirectoryResponse = {
  kpis: ConsumerDirectoryKpis;
  data: ConsumerListItem[];
  note?: string;
  revealMeta?: {
    withFullPhone: number;
    withoutFullPhone: number;
  };
};

export type ConsumerAuthRow = {
  product: string;
  pin: string;
  batch: string;
  date: string;
  result: string;
  resultCode?: string;
  pointsEarned?: number;
  giftAwarded?: string | null;
};

export type ConsumerGiftRow = {
  gift: string;
  pool: string;
  pin: string;
  result: string;
  won: string;
  status: string;
  statusRaw?: string;
  redeemedAt: string;
  rep: string;
  method: string;
};

export type ConsumerReportRow = {
  ref: string;
  pin: string;
  product: string;
  batch: string;
  reported: string;
  status: string;
  result?: string;
};

export type ConsumerDetail = {
  id: string;
  name: string;
  phone: string;
  email: string;
  hasFullPhone?: boolean;
  joined: string;
  status: ConsumerStatus;
  points: number;
  authentications: number;
  pointsToNextGift: number;
  progressToNextGift: number;
  giftsWon: number;
  giftsRedeemed: number;
  nearNextGift: boolean;
  auths: ConsumerAuthRow[];
  gifts: ConsumerGiftRow[];
  reports: ConsumerReportRow[];
};

export type ConsumerExportPayload = {
  headers: string[];
  rows: (string | number)[][];
  count: number;
};
