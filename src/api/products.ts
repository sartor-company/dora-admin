import { apiClient, unwrap } from './client';
import { useAuthStore } from '../store/authStore';
import type { ApiProduct } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export type ProductImageSlot =
  | 'front'
  | 'back'
  | 'top'
  | 'right'
  | 'left'
  | 'bottom';

export const productsApi = {
  list: async () => {
    const res = await apiClient.get('/products', { params: { limit: 'all' } });
    const data = unwrap<{ data: ApiProduct[] }>(res);
    return data.data ?? [];
  },

  get: async (id: string) => {
    const res = await apiClient.get(`/product/${id}`);
    return unwrap<ApiProduct>(res);
  },

  create: async (body: {
    productName: string;
    manufacturer?: string;
    barcodeNumber?: string;
    description?: string;
    productCategory?: string;
    doraCategory?: string;
    sizeVolume?: string;
    skuLabelName?: string;
    labelConfig?: '2sided' | '1sided' | '6sided';
  }) => {
    const res = await apiClient.post('/product', body);
    return unwrap<ApiProduct>(res);
  },

  update: async (
    id: string,
    body: {
      productName?: string;
      manufacturer?: string;
      barcodeNumber?: string;
      description?: string;
      status?: string;
      productCategory?: string;
      doraCategory?: string;
      sizeVolume?: string;
      skuLabelName?: string;
      labelConfig?: '2sided' | '1sided' | '6sided';
    },
  ) => {
    const res = await apiClient.put(`/product/edit/${id}`, body);
    return unwrap<ApiProduct>(res);
  },

  uploadReferenceImages: async (
    id: string,
    files: Partial<Record<ProductImageSlot, File | null>>,
    labelConfig: '2sided' | '1sided' | '6sided',
  ) => {
    const form = new FormData();
    let hasFile = false;

    const append = (field: string, file?: File | null) => {
      if (!file) return;
      form.append(field, file);
      hasFile = true;
    };

    if (labelConfig === '6sided') {
      const map: [ProductImageSlot, string][] = [
        ['top', 'side_0'],
        ['front', 'front_image'],
        ['right', 'side_2'],
        ['back', 'back_image'],
        ['left', 'side_4'],
        ['bottom', 'side_5'],
      ];
      map.forEach(([slot, field]) => append(field, files[slot]));
    } else {
      append('front_image', files.front);
      if (labelConfig === '2sided') append('back_image', files.back);
    }

    if (!hasFile) return null;

    const token = useAuthStore.getState().token;
    const res = await fetch(`${baseURL}/product/${id}/reference-images`, {
      method: 'POST',
      headers: token ? { 's-token': token } : {},
      body: form,
    });

    const json = await res.json();
    if (!json.status) throw new Error(json.message || 'Image upload failed');
    return json.data as ApiProduct;
  },
};
