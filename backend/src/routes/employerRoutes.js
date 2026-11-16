import { Router } from 'express';
import {
  getEmployers,
  suggestEmployer,
  approveEmployer,
  mergeEmployer,
} from '../controllers/employerController.js';
import { authenticate, requireRole, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getEmployers);
router.post('/suggest', authenticate, suggestEmployer);
router.patch('/:id/approve', authenticate, requireApproved, requireRole('ADMIN'), approveEmployer);
router.post('/:id/merge', authenticate, requireApproved, requireRole('ADMIN'), mergeEmployer);

export default router;
