import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controller';
import { logoutUser } from '../controllers/auth.controller';
import {
  updateProfileValidationRules,
  validateRequest,
} from '../middleware/validation';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

router.use(authenticateToken);

// Authenticated routes
router.post('/refresh-token',);
router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidationRules, validateRequest, updateUserProfile);
router.post('/logout', logoutUser);

export default router;