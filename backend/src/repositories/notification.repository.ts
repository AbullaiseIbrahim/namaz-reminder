import { prisma } from '../config/database';

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const notificationRepository = {
  getAll: async (userId: string) => {
    const existing = await prisma.notificationPreference.findMany({ where: { userId } });

    // Ensure all 5 prayers have a record (upsert defaults if missing)
    const missing = PRAYER_NAMES.filter(p => !existing.find(e => e.prayerName === p));
    if (missing.length) {
      await prisma.notificationPreference.createMany({
        data: missing.map(prayerName => ({ userId, prayerName, enabled: false, offsetMinutes: 0 })),
        skipDuplicates: true,
      });
      return prisma.notificationPreference.findMany({ where: { userId } });
    }
    return existing;
  },

  upsert: (userId: string, prayerName: string, enabled: boolean, offsetMinutes: number) =>
    prisma.notificationPreference.upsert({
      where: { userId_prayerName: { userId, prayerName } },
      update: { enabled, offsetMinutes },
      create: { userId, prayerName, enabled, offsetMinutes },
    }),

  updateMany: async (userId: string, prefs: Array<{ prayerName: string; enabled: boolean; offsetMinutes: number }>) => {
    await Promise.all(prefs.map(p => notificationRepository.upsert(userId, p.prayerName, p.enabled, p.offsetMinutes)));
  },
};
