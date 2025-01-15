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

router.get('/assigned-papers', getAssignedPapers);
router.get('/questions', getQuestions);
router.get('/review/:id', getReviewById);
router.post('/submit-review', validateReviewSubmission, validateRequest, submitReview);
router.patch("/update-review/:reviewId", validateReviewUpdate, validateRequest, updateReview);
router.post("/contact-admin", contactAdmin);
router.post("/notify-reviewer", notifyReviewer);
router.get('/download/:paperId', downloadPaper);

export default router;