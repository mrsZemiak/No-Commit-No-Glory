import { Request, Response } from 'express';
import Database from '../config/db';

const db = Database.getInstance();
const Review = db.getConnection().model('Review');
const Paper = db.getConnection().model('Paper');

// Reviewer: View assigned papers
export const viewAssignedPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewerId } = req.body;

        const papers = await Paper.find({ reviewer: reviewerId, status: 'assigned' });
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch assigned papers', error });
    }
};

// Reviewer: Submit a review
export const submitReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paperId, reviewerId, responses, recommendation } = req.body;

        const newReview = new Review({
            paper: paperId,
            reviewer: reviewerId,
            responses,
            recommendation,
        });

        await newReview.save();
        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit review', error });
    }
};