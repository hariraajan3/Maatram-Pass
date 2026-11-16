import { Router } from 'express';
import { getConsents, updateConsent, updateProfile } from '../controllers/onboardingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/consents', authenticate, getConsents);
router.post('/consent', authenticate, updateConsent);
router.patch('/profile', authenticate, updateProfile);

export default router;
