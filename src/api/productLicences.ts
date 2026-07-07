import { apiClient, unwrap } from './client';

export interface ProductLicence {
  _id: string;
  authority: string;
  number: string;
  country: string;
  market: string;
  validFrom?: number;
  validTo: number;
}

export const productLicencesApi = {
  list: async (productId: string) => {
    const res = await apiClient.get(`/product/${productId}/licences`);
    const data = unwrap<{ data: ProductLicence[] }>(res);
    return data.data ?? [];
  },

  add: async (
    productId: string,
    body: {
      authority: string;
      number: string;
      country?: string;
      market?: string;
      validFrom?: number;
      validTo: number;
    },
  ) => {
    const res = await apiClient.post(`/product/${productId}/licences`, body);
    return unwrap<ProductLicence>(res);
  },

  remove: async (productId: string, licenceId: string) => {
    const res = await apiClient.delete(`/product/${productId}/licences/${licenceId}`);
    return unwrap(res);
  },
};
