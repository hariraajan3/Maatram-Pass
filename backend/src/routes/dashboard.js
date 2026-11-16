import { Router } from 'express';
import { getVolunteerDashboard, getLeaderboard } from '../controllers/dashboardController.js';
import { authenticate, requireApproved } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/volunteer', authenticate, requireApproved, getVolunteerDashboard);
router.get('/leaderboard', authenticate, requireApproved, getLeaderboard);

export default router;
