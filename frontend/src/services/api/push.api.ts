import api from './axios';

export const pushApi = {
  getVapidPublicKey: (): Promise<string> =>
    api.get<{ publicKey: string }>('/user/vapid-public-key').then(r => r.data.publicKey),

  subscribe: (sub: PushSubscriptionJSON): Promise<void> =>
    api.post('/user/push-subscription', sub).then(() => undefined),

  unsubscribe: (endpoint: string): Promise<void> =>
    api.delete('/user/push-subscription', { data: { endpoint } }).then(() => undefined),
};
