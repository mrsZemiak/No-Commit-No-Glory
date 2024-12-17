import { Router } from 'express';
import { submitPaper, viewMyPapers } from '../controllers/participant.controller';

const router = Router();

router.post('/papers', submitPaper);
router.get('/papers', viewMyPapers);

export default router;