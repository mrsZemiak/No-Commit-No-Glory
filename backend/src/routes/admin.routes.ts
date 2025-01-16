import { Router } from 'express';
import {
  getAllUsers,
  editUserDetails,
  getAllCategories,
  createCategory,
  updateCategory,
  getAllConferences,
  createConference,
  updateConference,
  getPapersGroupedByConference,
  assignReviewer,
  downloadPapersByConference,
  changeSubmissionDeadline,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteCategory,
  getConferenceById,
  getQuestionById,
  getAdminReports,
} from '../controllers/admin.controller'
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

//Apply authentication and admin authorization globally for all admin routes
router.use(authenticateToken);

//Users
router.get('/users', getAllUsers);
router.patch('/users/:userId',  editUserDetails); //validateEditUserDetails, validateRequest,

//Categories
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.patch('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// Conferences
router.get('/conferences', getAllConferences);
router.get('/conferences/:id', getConferenceById);
router.post('/conferences', createConference);
router.patch('/conferences/:id', updateConference);

// Questions for reviews
router.get('/questions', getAllQuestions);
router.get('/questions/:questionId', getQuestionById);
router.post('/questions', createQuestion);
router.patch('/questions/:questionId', updateQuestion)

//Papers by conference
router.get('/papers', getPapersGroupedByConference);
router.get('/papers/download', downloadPapersByConference);
router.patch('/papers/:paperId/reviewer', assignReviewer); //Assign reviewer to paper
router.patch('/papers/:paperId/deadline', changeSubmissionDeadline); // Change submission deadline for a specific paper

router.get("/reports", getAdminReports);
export default router;