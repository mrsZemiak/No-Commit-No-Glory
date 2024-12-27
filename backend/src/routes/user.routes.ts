import { Router } from 'express';
import {getUserProfile, registerUser, updateUserProfile, verifyEmail} from '../controllers/user.controller';
import {
    registerValidationRules,
    updateProfileValidationRules,
    validateRequest,
    verifyEmailValidationRules
} from '../middleware/validation';
import { authenticateToken } from '../middleware/authenticateToken'

const router = Router();

// Add validation middleware before controller
router.post('/register', registerValidationRules, validateRequest, registerUser);
router.get('/verify-email/:token', verifyEmailValidationRules, verifyEmail);
// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, updateProfileValidationRules, validateRequest, updateUserProfile);


export default router;