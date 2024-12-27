import { Request, Response } from 'express';
import Paper from '../models/Paper'

// Participant: Submit a new paper
export const submitPaper = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, file_link, category, user } = req.body;

        const newPaper = new Paper({
            title,
            file_link,
            category,
            user,
            status: 'submitted',
            submission_date: new Date(),
        });

        await newPaper.save();
        res.status(201).json({ message: 'Paper submitted successfully', paper: newPaper });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit paper', error });
    }
};

// Participant: View all papers submitted by the user
export const viewMyPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        const papers = await Paper.find({ user: userId });
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch papers', error });
    }
};