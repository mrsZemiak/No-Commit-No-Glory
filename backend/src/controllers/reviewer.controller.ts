import { Request, Response } from 'express';
import Review from '../models/Review';
import Paper from '../models/Paper';

// Reviewer: View assigned papers
export const viewAssignedPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewerId } = req.query;
        console.log(reviewerId);
        const papers = await Paper.find({ reviewer: reviewerId, status: 'under review'}).populate('conference', 'year');
        console.log(papers);
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