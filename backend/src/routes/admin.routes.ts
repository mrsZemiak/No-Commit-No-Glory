import { Router } from 'express';
import {
    getAllUsers,
    createCategory,
    createConference,
    getAllConferences,
    updateConference
} from '../controllers/admin.controller';
import {authorizeRole} from "../middleware/autorizeRole";

const router = Router();

router.get('/users', getAllUsers);
router.post('/categories', createCategory);
router.post('/conferences', authorizeRole(['admin']), createConference);
router.put('/conferences/:conferenceId', authorizeRole(['admin']), updateConference);
router.get('/conferences', getAllConferences);
//router.delete('/conferences/:conferenceId', deleteConference);

export default router;