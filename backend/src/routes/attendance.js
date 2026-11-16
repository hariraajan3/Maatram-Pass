import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getOpportunityAttendance,
  getNeedsReview,
  editAttendance,
} from '../controllers/attendanceController.js';
import { authenticate, requireRole, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

// Scanning and manual check-in/out by OFFICE_TEAM and ADMIN
router.post('/checkin', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), checkIn);
router.post('/checkout', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), checkOut);
router.get('/opportunity/:opportunityId', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getOpportunityAttendance);
router.get('/needs-review', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getNeedsReview);
router.patch('/:id', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), editAttendance);

export default router;
