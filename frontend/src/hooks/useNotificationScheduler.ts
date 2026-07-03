import { useEffect, useRef } from 'react';
import { NotificationPref } from '../services/api/notification.api';

interface PrayerTimes {
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
  [key: string]: string | undefined;
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

// Play a simple beep alarm using Web Audio API
function playAlarm() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [880, 1100, 880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.35);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.35 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.35 + 0.3);
      osc.start(ctx.currentTime + i * 0.35);
      osc.stop(ctx.currentTime + i * 0.35 + 0.35);
    });
  } catch {
    // Audio not supported
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function showNotification(prayerName: string, offsetMinutes: number) {
  const label = PRAYER_LABELS[prayerName] ?? prayerName;
  let body: string;
  if (offsetMinutes < 0) {
    body = `${label} is in ${Math.abs(offsetMinutes)} minutes`;
  } else if (offsetMinutes > 0) {
    body = `${label} time was ${offsetMinutes} minutes ago`;
  } else {
    body = `It's time for ${label} prayer`;
  }

  playAlarm();

  if (Notification.permission === 'granted') {
    new Notification(`🕌 ${label} Prayer`, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `prayer-${prayerName}`,
      requireInteraction: true,
    });
  }
}

export function useNotificationScheduler(
  prayerTimes: PrayerTimes | null | undefined,
  prefs: NotificationPref[] | undefined,
  dateStr: string, // "YYYY-MM-DD"
) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!prayerTimes || !prefs) return;

    // Clear previously scheduled alarms
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const enabledPrefs = prefs.filter(p => p.enabled);
    if (enabledPrefs.length === 0) return;

    requestNotificationPermission().then(granted => {
      if (!granted) return;

      enabledPrefs.forEach(pref => {
        const rawTime = prayerTimes[pref.prayerName];
        if (!rawTime) return;

        // Parse "HH:mm" prayer time as today's date
        const [hours, minutes] = rawTime.split(':').map(Number);
        const prayerDate = new Date(`${dateStr}T00:00:00`);
        prayerDate.setHours(hours, minutes, 0, 0);

        // Apply offset
        const alarmTime = new Date(prayerDate.getTime() + pref.offsetMinutes * 60 * 1000);
        const msUntilAlarm = alarmTime.getTime() - Date.now();

        if (msUntilAlarm <= 0) return; // Already passed

        const timer = setTimeout(() => {
          showNotification(pref.prayerName, pref.offsetMinutes);
        }, msUntilAlarm);

        timersRef.current.push(timer);
      });
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [prayerTimes, prefs, dateStr]);
}
