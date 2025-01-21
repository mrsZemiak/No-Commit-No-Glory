import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile, upload
} from '../controllers/user.controller'
import { logoutUser } from '../controllers/auth.controller'
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

router.use(authenticateToken);

// Authenticated routes
router.get('/profile', getUserProfile);
router.patch('/profile', upload.single('avatar'), async (req, res) => {
  try {
    await updateUserProfile(req, res);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});
router.post('/logout', logoutUser);

export default router;