import { useEffect, useRef, useState } from 'react';
import { pushApi } from '../services/api/push.api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export type PushStatus = 'idle' | 'subscribing' | 'subscribed' | 'denied' | 'unsupported';

/**
 * Manages the full Web Push subscription lifecycle:
 * 1. Request notification permission
 * 2. Subscribe via PushManager
 * 3. POST subscription to backend
 *
 * Called automatically when the user has ≥1 notification pref enabled.
 */
export function usePushSubscription(hasEnabledPrefs: boolean) {
  const [status, setStatus] = useState<PushStatus>('idle');
  const attempted = useRef(false);

  useEffect(() => {
    if (!hasEnabledPrefs) return;
    if (attempted.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    attempted.current = true;
    void subscribe();
  }, [hasEnabledPrefs]);

  async function subscribe() {
    setStatus('subscribing');

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      // 2. Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Check for existing subscription
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        // 4. Fetch VAPID public key from backend
        const vapidKey = await pushApi.getVapidPublicKey();

        // 5. Subscribe
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      // 6. Send subscription to backend
      await pushApi.subscribe(sub.toJSON());
      setStatus('subscribed');

    } catch (err) {
      console.error('[push] Subscribe failed:', err);
      setStatus('idle');
    }
  }

  return { status, resubscribe: subscribe };
}
