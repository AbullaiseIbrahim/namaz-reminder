import { Request, Response } from 'express';
import { pushRepository } from '../repositories/push.repository';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';

export const pushController = {
  /** GET /user/vapid-public-key  — frontend needs this to subscribe */
  getVapidPublicKey(_req: Request, res: Response): void {
    res.json({ publicKey: env.vapid.publicKey });
  },

  /** POST /user/push-subscription  — save browser push subscription */
  async subscribe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { endpoint, keys } = req.body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ message: 'Invalid subscription object' });
      return;
    }

    const sub = await pushRepository.upsert(userId, endpoint, keys.p256dh, keys.auth);
    res.status(201).json(sub);
  },

  /** DELETE /user/push-subscription  — remove subscription (user unsubscribes) */
  async unsubscribe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { endpoint } = req.body as { endpoint: string };
    if (!endpoint) { res.status(400).json({ message: 'endpoint required' }); return; }
    await pushRepository.delete(endpoint);
    res.json({ message: 'Unsubscribed' });
  },
};
