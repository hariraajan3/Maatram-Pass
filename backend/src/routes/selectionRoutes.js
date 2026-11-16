import { Router } from 'express';
import {
  applyOrInterest,
  getMyApplications,
  selectVolunteer,
  confirmApplication,
  withdrawApplication,
  promoteFromWaitlist,
} from '../controllers/selectionController.js';
import { authenticate, requireRole, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/apply', authenticate, requireApproved, applyOrInterest);
router.get('/my', authenticate, requireApproved, getMyApplications);
router.patch('/:id/confirm', authenticate, requireApproved, confirmApplication);
router.patch('/:id/withdraw', authenticate, requireApproved, withdrawApplication);

// Office team & Admin management
router.patch('/:id/select', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), selectVolunteer);
router.patch('/:id/promote', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), promoteFromWaitlist);

export default router;
