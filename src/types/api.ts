export interface ApiProduct {
  _id: string;
  productName: string;
  batchId?: string;
  productId?: string;
  skuCode?: string;
  skuLabelName?: string;
  sizeVolume?: string;
  barcodeNumber?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  productImage?: string | null;
  labelConfig?: '2sided' | '1sided' | '6sided';
  subdomain?: string;
  status?: string;
  batches?: ApiBatch[];
  totalQuantityAvailable?: number;
  creationDateTime?: number;
}

export interface ApiBatch {
  _id: string;
  batchNumber: string;
  manufacturer?: string;
  invoiceNumber?: string;
  image?: string;
  backImage?: string;
  doraStatus?: 'pending' | 'training' | 'ready';
  quantity: number;
  expiryDate?: number;
  manufactureDate?: number;
  unitsPerCarton?: number;
  pinFormat?: string;
  status?: string;
  product?: ApiProduct | string;
  supplier?: { _id: string; name?: string } | string;
  creationDateTime?: number;
}

export interface ApiSupplier {
  _id: string;
  name: string;
  email: string;
}

export interface ApiNotification {
  _id: string;
  notification: string;
  user?: string;
  status: boolean;
  type?: number;
  creationDateTime?: number;
}

export interface ApiTeamMember {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  consoleRole?: 'batch' | 'brand' | 'inv';
  blocked?: boolean;
}
