import { Router } from 'express';
import {
  getEngagementReport,
  getEmployerReport,
  getEmployerCsv,
  getWhoToCall,
} from '../controllers/reportController.js';
import { authenticate, requireRole, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/engagement', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getEngagementReport);
router.get('/employer', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getEmployerReport);
router.get('/employer/csv', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getEmployerCsv);
router.get('/who-to-call', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getWhoToCall);

export default router;
