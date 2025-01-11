import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile, upload
} from '../controllers/user.controller'
import { logoutUser, refreshToken } from '../controllers/auth.controller'
import {
  updateProfileValidationRules,
  validateRequest,
} from '../middleware/validation';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

router.use(authenticateToken);

// Authenticated routes
router.post('/refresh-token', refreshToken);
router.get('/profile', getUserProfile);
router.patch('/profile', updateProfileValidationRules, upload.single('avatar'), validateRequest, updateUserProfile);
router.post('/logout', logoutUser);

export default router;