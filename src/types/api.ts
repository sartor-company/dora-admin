export interface ApiProduct {
  _id: string;
  productName: string;
  batchId?: string;
  barcodeNumber?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  productImage?: string | null;
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
  quantity: number;
  expiryDate?: number;
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
  blocked?: boolean;
}
