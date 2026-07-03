/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// ── Workbox precaching ────────────────────────────────────────────
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Push notification handler ─────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  let payload: {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: { url?: string; prayer?: string };
  } = {};

  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { title: event.data?.text() };
  }

  const title   = payload.title  ?? 'Salah Companion';
  const options: NotificationOptions = {
    body:  payload.body  ?? 'Prayer time',
    icon:  payload.icon  ?? '/pwa-192x192.png',
    badge: payload.badge ?? '/favicon-32.png',
    tag:   payload.tag   ?? 'prayer',
    data:  payload.data  ?? { url: '/' },
    // Vibrate: 200ms on, 100ms off, 200ms on
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click — open the app ────────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? '/prayers';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is already open in a tab, focus it
        for (const client of clientList) {
          if ('focus' in client) {
            (client as WindowClient).navigate(targetUrl);
            return (client as WindowClient).focus();
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(targetUrl);
      }),
  );
});
