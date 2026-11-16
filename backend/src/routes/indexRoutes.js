import { Router } from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import attendanceRoutes from './attendance.js';
import dashboardRoutes from './dashboard.js';
import onboardingRoutes from './onboarding.js';
import scheduleRoutes from './schedule.js';
import selectionRoutes from './selectionRoutes.js';
import userRoutes from './userRoutes.js';
import reportRoutes from './reportRoutes.js';
import employerRoutes from './employerRoutes.js';
import passRoutes from './passRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/selection', selectionRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/employers', employerRoutes);
router.use('/pass', passRoutes);

export default router;
