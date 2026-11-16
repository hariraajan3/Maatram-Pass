import { Router } from 'express';
import { getPublicPass, getPassQr } from '../controllers/passController.js';

const router = Router();

router.get('/:userId', getPublicPass);
router.get('/:userId/qr', getPassQr);

export default router;
