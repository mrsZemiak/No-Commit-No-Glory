import { Router } from 'express';
import { editPaper, submitPaper, viewMyPapers } from '../controllers/participant.controller'
import { validateSubmitPaper } from '../middleware/validation'
import { authenticateToken } from '../middleware/authenticateToken'

const router = Router();

router.use(authenticateToken);

router.post('/papers', validateSubmitPaper, submitPaper);
router.get('/papers', viewMyPapers);
router.put('/papers/:paperId', editPaper)

export default router;