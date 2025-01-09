import { Router } from 'express';
import {
    registerUser,
    verifyEmail,
} from '../controllers/user.controller';
import { loginUser } from '../controllers/auth.controller';
import {
    registerValidationRules,
    verifyEmailValidationRules,
    validateRequest,
} from '../middleware/validation';
import { getHomepageData } from '../controllers/homepage.controller'

const router = Router();

// Unauthenticated routes
router.get('/homepage', getHomepageData);
router.post('/register', registerValidationRules, validateRequest, registerUser); // Registration
router.post('/login', loginUser); // Login
router.post('/verify-email', verifyEmailValidationRules, validateRequest, verifyEmail); // Email verification

export default router;