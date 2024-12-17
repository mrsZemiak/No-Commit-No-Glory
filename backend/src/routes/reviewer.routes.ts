import { Router } from 'express';
import { viewAssignedPapers, submitReview } from '../controllers/reviewer.controller';

const router = Router();

router.get('/assigned-papers', viewAssignedPapers);
router.post('/reviews', submitReview);

export default router;