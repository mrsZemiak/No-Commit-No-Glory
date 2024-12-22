import express, { Request, Response } from 'express';
import Question from '../models/Question';
import { IQuestion } from '../models/Question';

const router = express.Router();

router.get('/questions', async (req: Request, res: Response): Promise<void> => {
    try {
        const questions: IQuestion[] = await Question.find();

        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

export default router;
