import { Router } from 'express';
import {getUserProfile, registerUser, updateUserProfile, verifyEmail} from '../controllers/user.controller';
import {
    registerValidationRules,
    updateProfileValidationRules,
    validateRequest,
    verifyEmailValidationRules
} from '../middleware/validation';

const router = Router();

// Add validation middleware before controller
router.post('/register', registerValidationRules, validateRequest, registerUser);
router.get('/verify-email/:token', verifyEmailValidationRules, verifyEmail);
// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', updateProfileValidationRules, validateRequest, updateUserProfile);


export default router;