import { apiClient, unwrap } from './client';

export interface TeamActivityItem {
  who: string;
  role: string;
  action: string;
  when: string;
  alert?: boolean;
}

export const activityApi = {
  recent: async () => {
    const res = await apiClient.get('/activity/recent');
    const data = unwrap<{ data: TeamActivityItem[] }>(res);
    return data.data ?? [];
  },
};
