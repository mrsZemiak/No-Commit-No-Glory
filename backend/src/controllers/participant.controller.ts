import { Request, Response } from 'express';
import Paper from '../models/Paper'

// Participant: Submit a new paper
export const submitPaper = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            title,
            file_link,
            category,
            user,
            conference,
            abstract,
            keywords,
            authors,
        } = req.body;

        console.log("Request body:", req.body);
        const newPaper = new Paper({
            title,
            file_link,
            category,
            user,
            conference,
            abstract,
            keywords: keywords.split(",").map((word: string) => word.trim()),
            authors,
            status: "submitted",
            submission_date: new Date(),
            final_submission: false,
        });

        await newPaper.save();
        res.status(201).json({ message: "Paper submitted successfully", paper: newPaper });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit paper", error });
    }
};

// Participant: View all papers submitted by the user
export const viewMyPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.query; //body;

        const papers = await Paper.find({ user: userId }).populate('category', 'name').populate('conference', 'year location university status');
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch papers', error });
    }
};