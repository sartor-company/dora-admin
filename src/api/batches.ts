import { apiClient, unwrap } from './client';
import { filenameFromDisposition, triggerBlobDownload } from '../utils/downloadBlob';
import type { ApiBatch } from '../types/api';

export const batchesApi = {
  list: async () => {
    const res = await apiClient.get('/batchs', { params: { limit: 'all' } });
    const data = unwrap<{ data: ApiBatch[] }>(res);
    return data.data ?? [];
  },

  get: async (id: string, includeLabels = false) => {
    const res = await apiClient.get(`/batch/${id}`, {
      params: includeLabels ? { includeLabels: 'true' } : undefined,
    });
    return unwrap<ApiBatch & { labels?: { length: number }[] }>(res);
  },

  create: async (body: {
    manufacturer: string;
    product: string;
    invoiceNumber: string;
    supplier: string;
    batch: Array<{
      quantity: number;
      batchNumber: string;
      expiryDate: number;
      sellingPrice?: number | null;
      supplyPrice?: number | null;
      manufactureDate?: number | null;
      snMode?: 'upload' | 'auto';
      serialNumbers?: string[];
      pinFormat?: string;
      unitsPerCarton?: number;
      cartonQrEnabled?: boolean;
      labelConfig?: '2sided' | '1sided' | '6sided';
    }>;
  }) => {
    const res = await apiClient.post('/batch', body);
    return unwrap<ApiBatch[]>(res);
  },

  update: async (
    id: string,
    body: { status?: string; quantity?: number; expiryDate?: number },
  ) => {
    const res = await apiClient.put(`/batch/edit/${id}`, body);
    return unwrap<ApiBatch>(res);
  },

  printPackage: async (id: string) => {
    const res = await apiClient.get(`/batch/${id}/print-package`);
    return unwrap<{
      batchId: string;
      batchNumber: string;
      productName: string;
      quantity: number;
      cartonCount: number;
      status: string;
      files: { id: string; title: string; desc: string; formats: string[] }[];
    }>(res);
  },

  logDownload: async (id: string, fileId: string, format: string) => {
    const res = await apiClient.post(`/batch/${id}/download-log`, { fileId, format });
    return unwrap<{ batchNumber: string; queued: boolean }>(res);
  },

  downloadFile: async (id: string, fileId: string, format: string) => {
    const res = await apiClient.get(`/batch/${id}/download/${fileId}`, {
      params: { format },
      responseType: 'blob',
    });
    const filename = filenameFromDisposition(res.headers['content-disposition'], `${fileId}.${format.toLowerCase()}`);
    triggerBlobDownload(res.data, filename);
  },

  downloadAsset: async (id: string, fileId: string, format: string) => {
    await batchesApi.logDownload(id, fileId, format);
    await batchesApi.downloadFile(id, fileId, format);
  },
};
