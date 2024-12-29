import { Router } from 'express';
import {
    getAllUsers,
    createCategory,
    createConference,
    getAllConferences,
    updateConference, getAllCategories, updateCategory, deleteCategory, viewAllPapers
} from '../controllers/admin.controller';
import {authorizeRole} from "../middleware/autorizeRole";

const router = Router();

router.get('/users', getAllUsers);
router.get('/categories', getAllCategories);
router.put('/categories/:categoryId',  updateCategory);
router.delete('/categories/:categoryId', deleteCategory);
router.post('/categories', createCategory);
router.post('/conferences', createConference); //, authorizeRole(['admin']), createConference);
router.put('/conferences/:conferenceId', updateConference);// authorizeRole(['admin']), updateConference);
router.get('/conferences', getAllConferences);
router.get('/papers', viewAllPapers);
//router.delete('/conferences/:conferenceId', deleteConference);

export default router;