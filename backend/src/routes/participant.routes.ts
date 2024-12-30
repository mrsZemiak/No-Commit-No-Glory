import { Router } from 'express';
import { validateSubmitPaper } from '../middleware/validation'
import { authenticateToken } from '../middleware/authenticateToken'
import {getPaperById, submitPaper, viewMyPapers, editPaper} from '../controllers/participant.controller';

const router = Router();

//router.use(authenticateToken);

router.post('/papers', validateSubmitPaper, submitPaper);
router.get('/papers', viewMyPapers);
router.put('/papers/:paperId', editPaper)
router.get('/papers/:paperId', getPaperById );

export default router;