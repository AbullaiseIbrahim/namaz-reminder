import { prisma } from '../config/database';

export const pushRepository = {
  /** Save or update a push subscription for a user */
  async upsert(userId: string, endpoint: string, p256dh: string, auth: string) {
    return prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth },
      update: { userId, p256dh, auth },
    });
  },

  /** Remove a subscription by endpoint */
  async delete(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } });
  },

  /** Get all subscriptions for a user */
  async getByUser(userId: string) {
    return prisma.pushSubscription.findMany({ where: { userId } });
  },

  /** Get every user who has at least one enabled notification pref,
   *  along with their subscriptions, prefs, and location */
  async getAllUsersWithSubs() {
    return prisma.user.findMany({
      where: {
        pushSubscriptions: { some: {} },
        notificationPrefs: { some: { enabled: true } },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        timezone: true,
        calculationMethod: true,
        madhab: true,
        pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } },
        notificationPrefs: { where: { enabled: true }, select: { prayerName: true, offsetMinutes: true } },
      },
    });
  },

  /** Remove a broken/expired subscription */
  async deleteByEndpoint(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } });
  },
};
