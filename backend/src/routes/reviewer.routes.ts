import { Router } from 'express';
import { viewAssignedPapers, submitReview } from '../controllers/reviewer.controller';
import { authenticateToken } from '../middleware/authenticateToken'
import { authorizeRole } from '../middleware/authorizeRole'

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['reviewer']));

router.get('/assigned-papers', viewAssignedPapers);
router.post('/reviews', submitReview);

export default router;