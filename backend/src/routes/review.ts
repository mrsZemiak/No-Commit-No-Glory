import express from 'express';
import Review from '../models/Review';

const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().populate('paper reviewer responses.question');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
});

// Create a new review
router.post('/', async (req, res) => {
    try {
        const { paper, reviewer, responses, comments, recommendation } = req.body;

        const review = new Review({
            paper,
            reviewer,
            responses,
            comments,
            recommendation,
            created_at: new Date(),
        });

        await review.save();
        res.status(201).json({ message: 'Review created successfully.', review });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create review.' });
    }
});

export default router;