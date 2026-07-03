import { userRepository } from '../repositories/user.repository';
import { prayerRepository } from '../repositories/prayer.repository';
import { calculatePrayerTimes } from '../utils/prayer-calculator';
import { AppError } from '../middlewares/error.middleware';
import { CalculationMethod, Madhab, PrayerName, PrayerStatus } from '../types';

export const prayerService = {
  getTodayTimes: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    if (!user.latitude || !user.longitude) {
      throw new AppError(400, 'Location not set. Please update your profile with your coordinates.');
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: user.timezone });

    // Return cached if available
    const cached = await prayerRepository.findPrayerTime(userId, today);
    if (cached) return cached;

    // Calculate and cache
    const times = calculatePrayerTimes(
      user.latitude,
      user.longitude,
      user.timezone,
      new Date(),
      user.calculationMethod as CalculationMethod,
      user.madhab as Madhab
    );

    await prayerRepository.upsertPrayerTime(userId, today, {
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha,
    });

    return times;
  },

  getMonthTimes: async (userId: string, yearMonth: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    if (!user.latitude || !user.longitude) {
      throw new AppError(400, 'Location not set.');
    }

    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const results = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: user.timezone });

      const cached = await prayerRepository.findPrayerTime(userId, dateStr);
      if (cached) {
        results.push(cached);
        continue;
      }

      const times = calculatePrayerTimes(
        user.latitude,
        user.longitude,
        user.timezone,
        date,
        user.calculationMethod as CalculationMethod,
        user.madhab as Madhab
      );

      await prayerRepository.upsertPrayerTime(userId, dateStr, {
        fajr: times.fajr,
        sunrise: times.sunrise,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      });

      results.push(times);
    }

    return results;
  },

  completePrayer: async (
    userId: string,
    prayerName: PrayerName,
    status: PrayerStatus = 'on_time',
    extra?: { notes?: string; khushuRating?: number }
  ) => {
    const today = new Date().toLocaleDateString('en-CA');
    const log = await prayerRepository.upsertLog(userId, today, prayerName, status, {
      ...extra,
      completedAt: new Date(),
    });

    await prayerService.updateStreak(userId);
    return log;
  },

  markQadha: async (
    userId: string,
    prayerName: PrayerName,
    date: string,
    extra?: { notes?: string }
  ) => {
    return prayerRepository.upsertLog(userId, date, prayerName, 'qadha', {
      ...extra,
      completedAt: new Date(),
    });
  },

  getLogsForDate: (userId: string, date: string) =>
    prayerRepository.findLogsForDate(userId, date),

  updateStreak: async (userId: string) => {
    // Compute current streak from logs
    const today = new Date();
    let streak = 0;
    let current = new Date(today);

    while (true) {
      const dateStr = current.toLocaleDateString('en-CA');
      const logs = await prayerRepository.findLogsForDate(userId, dateStr);
      const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const completedAll = prayers.every(p =>
        logs.some(l => l.prayerName === p && l.status !== 'missed')
      );

      if (!completedAll) break;
      streak++;
      current.setDate(current.getDate() - 1);
    }

    const existing = await prayerRepository.findStreak(userId);
    const longestStreak = Math.max(streak, existing?.longestStreak ?? 0);
    await prayerRepository.upsertStreak(userId, longestStreak);

    return { currentStreak: streak, longestStreak };
  },
};
