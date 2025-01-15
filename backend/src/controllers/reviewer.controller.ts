import { Response } from 'express'
import Review from '../models/Review'
import Paper, { PaperStatus } from '../models/Paper'
import { AuthRequest } from '../middleware/authenticateToken'
import { sendEmail } from '../utils/emailService'
import User from '../models/User'
import Question from '../models/Question'

// Get assigned papers for a reviewer
export const getAssignedPapers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reviewerId = req.params.reviewerId;
        const papers = await Paper.find({ reviewer: reviewerId });

        if (!papers.length) {
            res.status(404).json({ message: "No papers assigned to this reviewer." });
            return;
        }

        res.status(200).json({ papers });
    } catch (error) {
        console.error("Error fetching assigned papers:", error);
        res.status(500).json({ error: "Failed to fetch assigned papers." });
    }
};

export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Fetch all questions, selecting only the necessary fields
        const questions = await Question.find().select("text type options");

        if (!questions || questions.length === 0) {
            res.status(404).json({ message: "No questions found." });
            return;
        }

        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions for reviewer:", error);
        res.status(500).json({ message: "Failed to fetch questions.", error });
    }
};

export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId, reviewerId, responses, recommendation, comments } = req.body;

        // Validate required fields
        if (!paperId || !reviewerId || !responses || !recommendation) {
            res.status(400).json({ message: "Missing required fields." });
            return;
        }

        // Check if a review already exists
        const existingReview = await Review.findOne({ paper: paperId, reviewer: reviewerId });
        if (existingReview) {
            res.status(400).json({ message: "Review already exists. Use the update endpoint instead." });
            return;
        }

        // Create a new review
        const newReview = new Review({
            paper: paperId,
            reviewer: reviewerId,
            responses,
            recommendation,
            comments,
        });
        await newReview.save();

        // Update paper status based on the recommendation
        const paperStatus = getPaperStatusFromRecommendation(recommendation);
        await Paper.findByIdAndUpdate(paperId, { status: paperStatus });

        res.status(201).json({ message: "Review successfully created.", review: newReview });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review.", error });
    }
};

const getPaperStatusFromRecommendation = (recommendation: string): PaperStatus => {
    switch (recommendation) {
        case "Publikovať":
            return PaperStatus.Accepted;
        case "Odmietnuť":
            return PaperStatus.Rejected;
        case "Publikovať_so_zmenami":
            return PaperStatus.AcceptedWithChanges;
        default:
            return PaperStatus.UnderReview;
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

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reviewId } = req.params;
        const { responses, comments, recommendation } = req.body;

        // Validate input
        if (!responses && !comments && !recommendation) {
            res.status(400).json({ message: "At least one field (responses, comments, or recommendation) must be provided for update." });
            return;
        }

        // Build the update object dynamically
        const updateFields: Partial<Record<keyof typeof req.body, any>> = {};
        if (responses) updateFields.responses = responses;
        if (comments) updateFields.comments = comments;
        if (recommendation) updateFields.recommendation = recommendation;

        // Find and update the review
        const updatedReview = await Review.findByIdAndUpdate(
          reviewId,
          { $set: updateFields }, // Dynamically set fields to update
          { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedReview) {
            res.status(404).json({ message: "Review not found." });
            return;
        }

        res.status(200).json({ message: "Review updated successfully.", review: updatedReview });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: "Failed to update review." });
    }
};

// Notify reviewer about assigned paper
export const notifyReviewer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reviewerId, paperId } = req.body;

        const reviewer = await User.findById(reviewerId);
        const paper = await Paper.findById(paperId);

        if (!reviewer || !paper) {
            res.status(404).json({ message: "Reviewer or paper not found." });
            return;
        }

        const emailContent = `
            <p>Dobrý deň, ${reviewer.first_name},</p>
            <p>Bol vám pridelený nový príspevok s názvom "<strong>${paper.title}</strong>" na posúdenie.</p>
            <p>Ak chcete získať prístup k novinám, prihláste sa do svojho účtu.</p>
            <p>S pozdravom, <br />váš tím SciSubmit</p>
        `;

        await sendEmail({
            to: reviewer.email,
            subject: "Nová práca pridelená na kontrolu",
            html: emailContent,
        });

        res.status(200).json({ message: "Notification sent to reviewer." });
    } catch (error) {
        console.error("Error notifying reviewer:", error);
        res.status(500).json({ error: "Failed to notify reviewer." });
    }
};

// Download assigned paper
export const downloadPaper = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const paperId = req.params.paperId;

        // Find the paper by ID
        const paper = await Paper.findById(paperId);
        if (!paper || !paper.file_link) {
            res.status(404).json({ message: "Paper not found or file not available." });
            return;
        }

        // Send the file for download
        res.download(paper.file_link, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to download the paper." });
            }
        });
    } catch (error) {
        console.error("Error downloading paper:", error);
        res.status(500).json({ error: "Failed to download paper." });
    }
};

// Contact admin
export const contactAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { subject, message } = req.body;

        // Validate input
        if (!subject || !message) {
            res.status(400).json({ message: "Subject and message are required." });
            return;
        }

        // Fetch admin emails from the database
        const admins = await User.find({ role: "admin" }).select("email");
        if (admins.length === 0) {
            res.status(404).json({ message: "No admins found." });
            return;
        }

        const adminEmails = admins.map((admin) => admin.email);

        // Send email to all admins
        for (const email of adminEmails) {
            await sendEmail({
                to: email,
                subject: `Dotaz recenzenta: ${subject}`,
                text: message,
                html: `<p>${message}</p>`,
            });
        }

        res.status(200).json({ message: "Message sent to all admins successfully." });
    } catch (error) {
        console.error("Error contacting admin:", error);
        res.status(500).json({ error: "Failed to contact admins." });
    }
};