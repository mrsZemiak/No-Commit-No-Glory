import { Request, Response } from 'express';
import Paper, { PaperStatus } from '../models/Paper'
import { AuthRequest } from '../middleware/authenticateToken'

export const submitPaper = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId; // Extract user ID from AuthRequest
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized. User is not logged in.' });
            return;
        }

        const { title, abstract, keywords, file_link, category, conference, authors, final_submission } = req.body;

        // Check for required fields
        if (!title || !abstract || !keywords || !file_link || !category || !conference) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Set status based on final_submission flag
        const status = final_submission ? PaperStatus.Submitted : PaperStatus.Draft;

        // Create the paper document
        const paper = new Paper({
            title,
            abstract,
            keywords,
            file_link,
            category,
            conference,
            authors,
            submission_date: new Date(),
            status,
            user: userId, // Use the userId from req.user
            final_submission: !!final_submission,
        });

        // Save the paper to the database
        const savedPaper = await paper.save();

        res.status(201).json({
            message: final_submission ? 'Paper submitted successfully' : 'Paper saved as draft',
            paper: savedPaper,
        });
    } catch (error) {
        console.error('Error submitting paper:', error);
        res.status(500).json({ message: 'Failed to submit paper', error });
    }
};

// Participant: View all papers submitted by the user
export const viewMyPapers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId; // Extract user ID from AuthRequest
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized. User not logged in.' });
            return;
        }

        // Find papers belonging to the user
        const papers = await Paper.find({ user: userId }).sort({ created_at: -1 }); // Sort by most recent
        res.status(200).json(papers);
    } catch (error) {
        console.error('Error fetching user papers:', error);
        res.status(500).json({ message: 'Failed to fetch papers', error });
    }
};

// Participant: Get a specific paper by its ID
export const getPaperById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId } = req.params;

        const paper = await Paper.findById(paperId)
          .populate('category', 'name')
          .populate('conference', 'year location university status');

        res.status(200).json(paper);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch paper', error });
    }
};

// Edit an existing paper
export const editPaper = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { paperId } = req.params;
        const updates = req.body;

        // Check if the paper exists and belongs to the user
        const paper = await Paper.findOne({ _id: paperId, user: userId });
        if (!paper) {
            res.status(404).json({ message: 'Paper not found or you are not authorized to edit it.' });
            return;
        }

        // Prevent editing status, user, or final_submission directly
        delete updates.status;
        delete updates.user;
        delete updates.final_submission;

        // Update the paper
        Object.assign(paper, updates);
        const updatedPaper = await paper.save();

        res.status(200).json({
            message: 'Paper updated successfully',
            paper: updatedPaper,
        });
    } catch (error) {
        console.error('Error editing paper:', error);
        res.status(500).json({ message: 'Failed to edit paper', error });
    }
};