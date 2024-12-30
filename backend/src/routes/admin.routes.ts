import { Router } from 'express';
import {
    getAllUsers, editUserDetails,
    getAllCategories, createCategory, updateCategory,
    getAllConferences, createConference, updateConference,
    viewAllPapers, assignReviewer, downloadPapersByConference, changeSubmissionDeadline, getPapersGroupedByConference,
} from '../controllers/admin.controller'
import { authorizeRole } from '../middleware/authorizeRole';
import { authenticateToken } from '../middleware/authenticateToken';
import { validateEditUserDetails, validateRequest } from '../middleware/validation';

const router = Router();

//Apply authentication and admin authorization globally for all admin routes
//router.use(authenticateToken);
//router.use(authorizeRole(['admin']));

//Users
router.get('/users', getAllUsers);
router.put('/user/edit', validateEditUserDetails, validateRequest, editUserDetails);

//Categories
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);

// Conferences
router.get('/conferences', getAllConferences);
router.post('/conferences', createConference);
router.patch('/conferences/:conferenceId', updateConference);

//Papers by conference
router.get('/papers', getPapersGroupedByConference);
router.get('/conferences/:conferenceId/papers/download', downloadPapersByConference);
router.patch('/papers/:paperId/reviewer', assignReviewer);

// Change submission deadline for a specific paper
router.patch('/papers/:paperId/deadline', changeSubmissionDeadline);


// Reviewer assignment
router.patch('/papers/:paperId/reviewer', assignReviewer);



// Uncomment or add additional admin routes as needed
// router.delete('/conferences/:conferenceId', deleteConference);

export default router;