import { Router } from 'express';
import {
  getUsers,
  updateUserStatus,
  getApprovalQueue,
  getAuditLogs,
  getSettings,
  updateSetting,
} from '../controllers/adminController.js';
import { authenticate, requireRole, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

// Approval queue accessible by OFFICE_TEAM and ADMIN
router.get('/approval-queue', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), getApprovalQueue);
router.patch('/users/:id/status', authenticate, requireApproved, requireRole('OFFICE_TEAM', 'ADMIN'), updateUserStatus);

// Strict ADMIN routes
router.get('/users', authenticate, requireApproved, requireRole('ADMIN'), getUsers);
router.get('/audit', authenticate, requireApproved, requireRole('ADMIN'), getAuditLogs);
router.get('/settings', authenticate, requireApproved, requireRole('ADMIN'), getSettings);
router.patch('/settings/:key', authenticate, requireApproved, requireRole('ADMIN'), updateSetting);

export default router;
