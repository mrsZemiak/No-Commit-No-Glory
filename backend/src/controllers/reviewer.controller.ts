import { Request, Response } from 'express';
import Review from '../models/Review';
import Paper, {PaperStatus} from '../models/Paper';

// Reviewer: View assigned papers
export const viewAssignedPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewerId } = req.query;
        const papers = await Paper.find({ reviewer: reviewerId, status: 'under review'}).populate('conference', 'year');
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch assigned papers', error });
    }
};

// Reviewer: Submit a review - check if there is an existing one
export const submitReview = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Request Body:', req.body);
        const { paperId, reviewerId, responses, recommendation= 'no_recommendation', status, isDraft } = req.body;


        let existingReview = await Review.findOne({ paper: paperId, reviewer: reviewerId });

        if (existingReview) {
            existingReview.responses = responses;
            existingReview.recommendation = recommendation;
            existingReview.isDraft = isDraft;


            await existingReview.save();
            res.status(200).json({ message: 'Review updated successfully', review: existingReview });
        } else {
            const newReview = new Review({
                paper: paperId,
                reviewer: reviewerId,
                responses,
                recommendation,
                status,
                isDraft,
            });
            await newReview.save();
            res.status(201).json({ message: 'Review submitted successfully', review: newReview });
        }
        //Using isDraft to choose the state of the paper
        let paperStatus = PaperStatus.UnderReview;

        if (!isDraft) {
            if (recommendation === 'publish') {
                paperStatus = PaperStatus.Accepted;
            } else if (recommendation === 'reject') {
                paperStatus = PaperStatus.Rejected;
            } else if (recommendation === 'publish_with_changes') {
                paperStatus = PaperStatus.AcceptedWithChanges;
            }
        }
        await Paper.findByIdAndUpdate(paperId, { status: paperStatus });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit review', error });
    }
};

//Get a single review based on IDs
export const getReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paperId, reviewerId } = req.params;

        const review = await Review.findOne({ paper: paperId, reviewer: reviewerId });

        if (review) {
            res.status(200).json({ message: 'Review found', review });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching review', error });
    }
};
