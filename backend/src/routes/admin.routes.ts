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
    createQuestion, updateQuestion
} from '../controllers/admin.controller'
import { authorizeRole } from '../middleware/authorizeRole';
import { authenticateToken } from '../middleware/authenticateToken';
import { validateEditUserDetails, validateRequest } from '../middleware/validation';

const router = Router();

//Apply authentication and admin authorization globally for all admin routes
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

//Users
router.get('/users', getAllUsers);
router.patch('/user/edit', validateEditUserDetails, validateRequest, editUserDetails);

//Categories
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.patch('/categories/:categoryId', updateCategory);

// Conferences
router.get('/conferences', getAllConferences);
router.post('/conferences', createConference);
router.patch('/conferences/:conferenceId', updateConference);

// Questions for reviews
router.get('/questions', getAllQuestions);
router.post('/questions', createQuestion);
router.patch('/questions/:questionId', updateQuestion)

//Papers by conference
router.get('/papers', getPapersGroupedByConference);
router.get('/papers/download', downloadPapersByConference);
router.patch('/papers/:paperId/reviewer', assignReviewer); //Assign reviewer to paper
router.patch('/papers/:paperId/deadline', changeSubmissionDeadline); // Change submission deadline for a specific paper

// Uncomment or add additional admin routes as needed
// router.delete('/conferences/:conferenceId', deleteConference);

export default router;