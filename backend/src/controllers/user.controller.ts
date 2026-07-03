import { Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository';
import { statisticsService } from '../services/statistics.service';
import { AppError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../types';

export const userController = {
  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userRepository.findById(req.user!.id);
      if (!user) throw new AppError(404, 'User not found');
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userRepository.update(req.user!.id, req.body);
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  },

  getDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await statisticsService.getDashboard(req.user!.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
