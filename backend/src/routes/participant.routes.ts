import { Router } from 'express';
import {editPaper, getPaperById, submitPaper, viewMyPapers} from '../controllers/participant.controller'
import { validateSubmitPaper } from '../middleware/validation'
import { authenticateToken } from '../middleware/authenticateToken'
import { authorizeRole } from '../middleware/authorizeRole'

const router = Router();

router.use(authenticateToken);
//router.use(authorizeRole(['participant']));

router.get('/papers', viewMyPapers);
router.post('/papers/submit', validateSubmitPaper, submitPaper);
router.put('/papers/:paperId', editPaper)
router.get('/papers/:paperId', getPaperById)

export default router;