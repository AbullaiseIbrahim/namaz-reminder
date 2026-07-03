import { Router } from 'express';
import { statisticsController } from '../controllers/statistics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', statisticsController.getMonthly);
router.get('/history', statisticsController.getHistory);

export default router;
