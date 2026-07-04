import webpush from 'web-push';
import cron from 'node-cron';
import { env } from '../config/env';
import { pushRepository } from '../repositories/push.repository';
import { calculatePrayerTimes } from '../utils/prayer-calculator';
import { CalculationMethod, Madhab } from '../types';

// ── Configure web-push once ────────────────────────────────────────
webpush.setVapidDetails(
  env.vapid.email,
  env.vapid.publicKey,
  env.vapid.privateKey,
);

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr 🌙',
  dhuhr: 'Dhuhr ☀️',
  asr: 'Asr 🌤',
  maghrib: 'Maghrib 🌅',
  isha: 'Isha 🌙',
};

const ARABIC: Record<string, string> = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};

function offsetLabel(mins: number): string {
  if (mins === 0) return 'Time to pray';
  if (mins < 0)  return `${Math.abs(mins)} min before prayer`;
  return `${mins} min after prayer started`;
}

/** Send a push to a single subscription, remove it if expired */
async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: object,
): Promise<void> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
  } catch (err: any) {
    // 410 Gone or 404 = subscription expired — clean it up
    if (err.statusCode === 410 || err.statusCode === 404) {
      await pushRepository.deleteByEndpoint(sub.endpoint);
    } else {
      console.error('[push] send error:', err.message);
    }
  }
}

/** Get current HH:MM minutes in a given timezone (avoids UTC vs local mismatch) */
function getNowMinutesInTz(now: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const h = parseInt(parts.find(p => p.type === 'hour')?.value   ?? '0', 10) % 24;
    const m = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
    return h * 60 + m;
  } catch {
    // Fallback to UTC if timezone is invalid
    return now.getUTCHours() * 60 + now.getUTCMinutes();
  }
}

/** Main function — called every minute by the cron job */
async function checkAndSendPrayerAlarms(): Promise<void> {
  const now = new Date();

  let users: Awaited<ReturnType<typeof pushRepository.getAllUsersWithSubs>>;
  try {
    users = await pushRepository.getAllUsersWithSubs();
  } catch (err) {
    console.error('[push-cron] DB error:', err);
    return;
  }

  for (const user of users) {
    if (!user.latitude || !user.longitude) continue;

    // nowMinutes in the USER's local timezone (not UTC)
    const nowMinutes = getNowMinutesInTz(now, user.timezone);

    // Calculate today's prayer times in the user's timezone
    let times: Record<string, string>;
    try {
      const pt = calculatePrayerTimes(
        user.latitude,
        user.longitude,
        user.timezone,
        now,
        user.calculationMethod as CalculationMethod,
        user.madhab as Madhab,
      );
      times = {
        fajr: pt.fajr, dhuhr: pt.dhuhr, asr: pt.asr,
        maghrib: pt.maghrib, isha: pt.isha,
      };
    } catch {
      continue;
    }

    for (const pref of user.notificationPrefs) {
      const rawTime = times[pref.prayerName]; // "HH:MM" in user's local timezone
      if (!rawTime) continue;

      const [h, m] = rawTime.split(':').map(Number);
      // Alarm fires at prayerTime + offsetMinutes
      const alarmMinutes = h * 60 + m + pref.offsetMinutes;

      if (alarmMinutes !== nowMinutes) continue;

      // ✅ It's alarm time — send push to all this user's subscriptions
      const label  = PRAYER_LABELS[pref.prayerName] ?? pref.prayerName;
      const arabic = ARABIC[pref.prayerName] ?? '';
      const body   = offsetLabel(pref.offsetMinutes);

      const payload = {
        title: `${label} — ${arabic}`,
        body,
        icon:  '/pwa-192x192.png',
        badge: '/favicon-32.png',
        tag:   `prayer-${pref.prayerName}`,   // replaces previous alarm for same prayer
        data:  { url: '/prayers', prayer: pref.prayerName },
      };

      for (const sub of user.pushSubscriptions) {
        await sendPush(sub, payload);
      }

      console.log(`[push] Sent ${pref.prayerName} alarm to user ${user.id}`);
    }
  }
}

/** Start the cron job — call once at server startup */
export function startPushCron(): void {
  if (!env.vapid.publicKey || !env.vapid.privateKey) {
    console.warn('[push] VAPID keys not set — push notifications disabled');
    return;
  }

  // Run at the start of every minute: "* * * * *"
  cron.schedule('* * * * *', () => {
    checkAndSendPrayerAlarms().catch(err =>
      console.error('[push-cron] Unhandled error:', err),
    );
  });

  console.log('[push] Prayer alarm cron started ✓');
}
