import { prayerRepository } from '../repositories/prayer.repository';
import { PrayerName } from '../types';

const PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const statisticsService = {
  getMonthlyStats: async (userId: string, yearMonth: string) => {
    const logs = await prayerRepository.findLogsForMonth(userId, yearMonth);

    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalPossible = daysInMonth * 5;
    const completed = logs.filter(l => l.status !== 'missed').length;

    const byPrayer = PRAYERS.map(prayer => {
      const prayerLogs = logs.filter(l => l.prayerName === prayer);
      const completedCount = prayerLogs.filter(l => l.status !== 'missed').length;
      return {
        prayer,
        completed: completedCount,
        total: daysInMonth,
        percentage: Math.round((completedCount / daysInMonth) * 100),
      };
    });

    // Build heatmap: date -> completion count (0-5)
    const heatmap: Record<string, number> = {};
    for (const log of logs) {
      if (log.status !== 'missed') {
        heatmap[log.date] = (heatmap[log.date] || 0) + 1;
      }
    }

    return {
      yearMonth,
      totalPossible,
      completed,
      percentage: Math.round((completed / totalPossible) * 100),
      byPrayer,
      heatmap,
    };
  },

  getDashboard: async (userId: string) => {
    const today = new Date().toLocaleDateString('en-CA');
    const [streak, todayLogs, achievements] = await Promise.all([
      prayerRepository.findStreak(userId),
      prayerRepository.findLogsForDate(userId, today),
      prayerRepository.findAchievements(userId),
    ]);

    const todayCompleted = todayLogs.filter(l => l.status !== 'missed').length;

    return {
      today: {
        date: today,
        completed: todayCompleted,
        total: 5,
        logs: todayLogs,
      },
      streak: {
        current: 0, // computed separately via prayerService.updateStreak
        longest: streak?.longestStreak ?? 0,
      },
      achievements,
    };
  },
};
