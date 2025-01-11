import { Request, Response } from 'express';
import Review from '../models/Review';
import Paper from '../models/Paper';
import { AuthRequest } from '../middleware/authenticateToken'

// Reviewer: View assigned papers
export const viewAssignedPapers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reviewerId } = req.query;
        const papers = await Paper.find({ reviewer: reviewerId, status: 'under review'}).populate('conference', 'year');

        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa načítať pridelené práce', error });
    }
};

// Reviewer: Submit a review - check if there is an existing one
export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('Request Body:', req.body);
        const { paperId, reviewerId, responses, recommendation, status } = req.body;
        let existingReview = await Review.findOne({ paper: paperId, reviewer: reviewerId });

        if (existingReview) {
            existingReview.responses = responses;
            existingReview.recommendation = recommendation;

            await existingReview.save();
            res.status(200).json({ message: 'Recenzia bola úspešne aktualizovaná', review: existingReview });
        } else {
            const newReview = new Review({
                paper: paperId,
                reviewer: reviewerId,
                responses,
                recommendation,
                status,
            });
            await newReview.save();
            res.status(201).json({ message: 'Recenzia bola úspešne odoslaná', review: newReview });
        }
        let paperStatus = 'under review';
        if (recommendation === 'publish') {
            paperStatus = 'accepted';
        } else if (recommendation === 'reject') {
            paperStatus = 'rejected';
        } else if (recommendation === 'publish_with_changes') {
            paperStatus = 'under review';
        }
        await Paper.findByIdAndUpdate(paperId, { status: paperStatus });
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa odoslať recenziu', error });
    }
};

//Get a single review based on IDs
export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId, reviewerId } = req.params;

        const review = await Review.findOne({ paper: paperId, reviewer: reviewerId });

        if (review) {
            res.status(200).json({ message: 'Recenzia bola nájdená', review });
        } else {
            res.status(404).json({ message: 'Recenzia nebola nájdená' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa načítať recenzie', error });
    }
};