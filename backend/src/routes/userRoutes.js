import { Router } from 'express';
import { getUser, getUserBadges } from '../controllers/userController.js';
import { authenticate, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/:id', authenticate, requireApproved, getUser);
router.get('/:id/badges', authenticate, requireApproved, getUserBadges);

export default router;
