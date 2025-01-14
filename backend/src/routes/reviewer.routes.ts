import { Router } from 'express';
import { viewAssignedPapers, submitReview } from '../controllers/reviewer.controller';
import { authenticateToken } from '../middleware/authenticateToken'

const router = Router();

router.use(authenticateToken);

router.get('/assigned-papers', viewAssignedPapers);
router.post('/reviews', submitReview);

export default router;