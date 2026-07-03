import { Router } from 'express';
import { z } from 'zod';
import { userController } from '../controllers/user.controller';
import { notificationController } from '../controllers/notification.controller';
import { pushController } from '../controllers/push.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  timezone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  calculationMethod: z.enum(['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari']).optional(),
  madhab: z.enum(['Hanafi', 'Shafi']).optional(),
});

const notifPrefsSchema = z.array(z.object({
  prayerName: z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
  enabled: z.boolean(),
  offsetMinutes: z.number().int().min(-60).max(60),
}));

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.get('/dashboard', userController.getDashboard);
router.get('/notifications', notificationController.getPrefs);
router.put('/notifications', validate(notifPrefsSchema), notificationController.updatePrefs);

// Web Push
router.get('/vapid-public-key', pushController.getVapidPublicKey);
router.post('/push-subscription', pushController.subscribe);
router.delete('/push-subscription', pushController.unsubscribe);

export default router;
