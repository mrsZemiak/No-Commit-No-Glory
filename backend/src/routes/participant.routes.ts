import { Router } from 'express';
import {
  editPaper,
  getCategories, getConferences,
  getPaperById, notifyParticipant,
  submitPaper,
  viewMyPapers
} from '../controllers/participant.controller'
//import { validateRequest, validateSubmitPaper } from '../middleware/validation'
import { authenticateToken } from '../middleware/authenticateToken'
import paperUpload from '../middleware/fileUpload'

const router = Router();

router.use(authenticateToken);

router.get('/papers', viewMyPapers);
router.post(
  '/papers',
  paperUpload.single('file_link'),
  //validateSubmitPaper,
  //validateRequest,
  submitPaper
);
router.get('/papers/:paperId', getPaperById)
router.patch('/papers/:paperId', editPaper)
router.get("/categories", getCategories)
router.get("/conferences", getConferences)
router.post("/notify-participant", notifyParticipant);


export default router;