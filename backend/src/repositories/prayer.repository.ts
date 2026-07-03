import { prisma } from '../config/database';
import { PrayerName, PrayerStatus } from '../types';

export const prayerRepository = {
  // Prayer Times (cache)
  findPrayerTime: (userId: string, date: string) =>
    prisma.prayerTime.findUnique({ where: { userId_date: { userId, date } } }),

  upsertPrayerTime: (userId: string, date: string, times: {
    fajr: string; sunrise: string; dhuhr: string;
    asr: string; maghrib: string; isha: string;
  }) =>
    prisma.prayerTime.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...times },
      update: { ...times },
    }),

  // Prayer Logs
  findLog: (userId: string, date: string, prayerName: PrayerName) =>
    prisma.prayerLog.findUnique({
      where: { userId_date_prayerName: { userId, date, prayerName } },
    }),

  findLogsForDate: (userId: string, date: string) =>
    prisma.prayerLog.findMany({ where: { userId, date } }),

  findLogsForMonth: (userId: string, yearMonth: string) =>
    prisma.prayerLog.findMany({
      where: { userId, date: { startsWith: yearMonth } },
      orderBy: { date: 'asc' },
    }),

  upsertLog: (userId: string, date: string, prayerName: PrayerName, status: PrayerStatus, extra?: {
    notes?: string;
    khushuRating?: number;
    completedAt?: Date;
  }) =>
    prisma.prayerLog.upsert({
      where: { userId_date_prayerName: { userId, date, prayerName } },
      create: { userId, date, prayerName, status, completedAt: new Date(), ...extra },
      update: { status, ...extra },
    }),

  // Streak
  findStreak: (userId: string) =>
    prisma.streak.findUnique({ where: { userId } }),

  upsertStreak: (userId: string, longestStreak: number) =>
    prisma.streak.upsert({
      where: { userId },
      create: { userId, longestStreak },
      update: { longestStreak },
    }),

  // Achievements
  findAchievements: (userId: string) =>
    prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } }),
};
