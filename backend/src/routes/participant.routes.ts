import { Router } from 'express';
import {getPaperById, submitPaper, viewMyPapers} from '../controllers/participant.controller';

const router = Router();

router.post('/papers', submitPaper);
router.get('/papers', viewMyPapers);
router.get('/papers/:paperId', getPaperById );

export default router;