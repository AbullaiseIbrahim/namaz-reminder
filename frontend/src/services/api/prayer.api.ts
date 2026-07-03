import api from './axios';
import { PrayerTimes, PrayerLog, PrayerName, PrayerStatus, Streak, MonthlyStats, DashboardData } from '../../types';

export const prayerApi = {
  getToday: () =>
    api.get<PrayerTimes>('/prayers/today').then(r => r.data),

  getMonth: (yearMonth: string) =>
    api.get<PrayerTimes[]>(`/prayers/month/${yearMonth}`).then(r => r.data),

  complete: (data: { prayerName: PrayerName; status?: PrayerStatus; notes?: string; khushuRating?: number }) =>
    api.post<PrayerLog>('/prayers/complete', data).then(r => r.data),

  qadha: (data: { prayerName: PrayerName; date: string; notes?: string }) =>
    api.post<PrayerLog>('/prayers/qadha', data).then(r => r.data),

  getStreak: () =>
    api.get<Streak>('/prayers/streak').then(r => r.data),

  getDashboard: () =>
    api.get<DashboardData>('/user/dashboard').then(r => r.data),

  getStatistics: (month?: string) =>
    api.get<MonthlyStats>('/statistics', { params: { month } }).then(r => r.data),

  getHistory: (date?: string) =>
    api.get<PrayerLog[]>('/statistics/history', { params: { date } }).then(r => r.data),
};
