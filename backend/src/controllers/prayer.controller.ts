import { Response, NextFunction } from 'express';
import { prayerService } from '../services/prayer.service';
import { AuthenticatedRequest } from '../types';

export const prayerController = {
  getToday: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const times = await prayerService.getTodayTimes(req.user!.id);
      res.json(times);
    } catch (err) {
      next(err);
    }
  },

  getMonth: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { yearMonth } = req.params; // e.g. "2026-06"
      const times = await prayerService.getMonthTimes(req.user!.id, yearMonth);
      res.json(times);
    } catch (err) {
      next(err);
    }
  },

  complete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { prayerName, status, notes, khushuRating } = req.body;
      const log = await prayerService.completePrayer(
        req.user!.id,
        prayerName,
        status,
        { notes, khushuRating }
      );
      res.json(log);
    } catch (err) {
      next(err);
    }
  },

  qadha: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { prayerName, date, notes } = req.body;
      const log = await prayerService.markQadha(req.user!.id, prayerName, date, { notes });
      res.json(log);
    } catch (err) {
      next(err);
    }
  },

  getStreak: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const streak = await prayerService.updateStreak(req.user!.id);
      res.json(streak);
    } catch (err) {
      next(err);
    }
  },
};
