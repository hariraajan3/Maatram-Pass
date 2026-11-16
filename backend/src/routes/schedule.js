import { Router } from 'express';
import {
  listOpportunities,
  createOpportunity,
  getOpportunityById,
  updateOpportunity,
  updateOpportunityStatus,
} from '../controllers/scheduleController.js';
import { authenticate, requireRole, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, requireApproved, listOpportunities);
router.get('/:id', authenticate, requireApproved, getOpportunityById);

// Staff and Admin routes
router.post('/', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), createOpportunity);
router.patch('/:id', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), updateOpportunity);
router.patch('/:id/status', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), updateOpportunityStatus);

export default router;
