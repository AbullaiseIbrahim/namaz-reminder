import { Router } from 'express';
import { z } from 'zod';
import { prayerController } from '../controllers/prayer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

const completeSchema = z.object({
  prayerName: z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
  status: z.enum(['on_time', 'late']).default('on_time'),
  notes: z.string().optional(),
  khushuRating: z.number().int().min(1).max(5).optional(),
});

const qadhSchema = z.object({
  prayerName: z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

router.get('/today', prayerController.getToday);
router.get('/month/:yearMonth', prayerController.getMonth);
router.post('/complete', validate(completeSchema), prayerController.complete);
router.post('/qadha', validate(qadhSchema), prayerController.qadha);
router.get('/streak', prayerController.getStreak);

export default router;
