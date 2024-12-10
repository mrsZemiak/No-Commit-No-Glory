import { Router } from 'express';
import { registerUser, verifyEmail } from '../controllers/user.controller';

const router = Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);

export default router;