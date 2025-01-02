import { Router } from 'express';
import {viewAssignedPapers, submitReview, getReview} from '../controllers/reviewer.controller';

const router = Router();

router.get('/assigned-papers', viewAssignedPapers);
router.post('/reviews', submitReview);
router.get('/reviews/:paperId/:reviewerId', getReview);

export default router;