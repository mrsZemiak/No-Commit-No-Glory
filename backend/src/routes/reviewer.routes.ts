import { Router } from 'express';
import {
  submitReview,
  getReviewById,
  downloadPaper,
  getAssignedPapers,
  contactAdmin, updateReview, getQuestions, notifyReviewer
} from '../controllers/reviewer.controller'
import { authenticateToken } from '../middleware/authenticateToken'
import { validateRequest, validateReviewSubmission, validateReviewUpdate } from '../middleware/validation'

const router = Router();

router.use(authenticateToken);

router.get('/papers', getAssignedPapers);
router.get('/papers/:paperId/download', downloadPaper);
router.get('/reviews/:reviewId', getReviewById);

router.get('/questions', getQuestions);
router.post('/submit-review', validateReviewSubmission, validateRequest, submitReview);
router.patch("/reviews/:reviewId", validateReviewUpdate, validateRequest, updateReview);

router.post("/contact-admin", contactAdmin);
router.post("/notify-reviewer", notifyReviewer);

export default router;