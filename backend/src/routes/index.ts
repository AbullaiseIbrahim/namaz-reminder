import { Router } from 'express';
import authRoutes from './auth.routes';
import prayerRoutes from './prayer.routes';
import userRoutes from './user.routes';
import statisticsRoutes from './statistics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/prayers', prayerRoutes);
router.use('/user', userRoutes);
router.use('/statistics', statisticsRoutes);

export default router;
