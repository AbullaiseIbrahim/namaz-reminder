import { Response, NextFunction } from 'express';
import { statisticsService } from '../services/statistics.service';
import { AuthenticatedRequest } from '../types';

export const statisticsController = {
  getMonthly: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const yearMonth = (req.query.month as string) ||
        new Date().toLocaleDateString('en-CA').slice(0, 7);
      const stats = await statisticsService.getMonthlyStats(req.user!.id, yearMonth);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  getHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query;
      const { prayerRepository } = await import('../repositories/prayer.repository');
      const logs = await prayerRepository.findLogsForDate(
        req.user!.id,
        (date as string) || new Date().toLocaleDateString('en-CA')
      );
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },
};
