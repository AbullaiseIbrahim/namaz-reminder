import api from './axios';

export interface NotificationPref {
  id: string;
  prayerName: string;
  enabled: boolean;
  offsetMinutes: number; // negative = before, 0 = at time, positive = after
}

export const notificationApi = {
  getPrefs: () =>
    api.get<NotificationPref[]>('/user/notifications').then(r => r.data),

  updatePrefs: (prefs: Array<{ prayerName: string; enabled: boolean; offsetMinutes: number }>) =>
    api.put<NotificationPref[]>('/user/notifications', prefs).then(r => r.data),
};
