import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const labelsApi = {
  upload: async (productId: string, batchId: string, frontImage: File, backImage: File) => {
    const form = new FormData();
    form.append('productId', productId);
    form.append('batchId', batchId);
    form.append('front_image', frontImage);
    form.append('back_image', backImage);

    const token = useAuthStore.getState().token;
    const res = await fetch(`${baseURL}/label/upload`, {
      method: 'POST',
      headers: token ? { 's-token': token } : {},
      body: form,
    });

    const json = await res.json();
    if (!json.status) throw new Error(json.message || 'Upload failed');
    return json.data;
  },
};
