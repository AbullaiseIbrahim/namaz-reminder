import { Response, NextFunction } from 'express';
import { notificationRepository } from '../repositories/notification.repository';
import { AuthenticatedRequest } from '../types';

export const notificationController = {
  getPrefs: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const prefs = await notificationRepository.getAll(req.user!.id);
      res.json(prefs);
    } catch (err) {
      next(err);
    }
  },

  updatePrefs: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // req.body is an array of { prayerName, enabled, offsetMinutes }
      await notificationRepository.updateMany(req.user!.id, req.body);
      const prefs = await notificationRepository.getAll(req.user!.id);
      res.json(prefs);
    } catch (err) {
      next(err);
    }
  },
};
