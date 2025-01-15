import { Response } from 'express'
import Review from '../models/Review'
import Paper, { PaperStatus } from '../models/Paper'
import { AuthRequest } from '../middleware/authenticateToken'
import { sendEmail } from '../utils/emailService'
import User from '../models/User'
import Question from '../models/Question'

//Assigned papers
export const getAssignedPapers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reviewerId = req.user?.userId;
        if (!reviewerId) {
            res.status(401).json({ message: "Neautorizované. Recenzent nie je prihlásený." });
            return;
        }

        const papers = await Paper.find({ reviewer: reviewerId })
          .select("title category keywords abstract file_link");

        if (!papers.length) {
            res.status(404).json({ message: "Žiadne práce pridelené tomuto recenzentovi." });
            return;
        }

        res.status(200).json(papers);
    } catch (error) {
        console.error("Error fetching assigned papers:", error);
        res.status(500).json({ error: "Nepodarilo sa načítať pridelené práce." });
    }
};

//Get all questions
export const getQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const questions = await Question.find().select("text type options");

        if (!questions.length) {
            res.status(404).json({ message: "Neboli nájdené žiadne otázky." });
            return;
        }

        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions for reviewer:", error);
        res.status(500).json({ message: "Nepodarilo sa načítať otázky.", error });
    }
};

//Create and submit review
export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId, reviewerId, responses, recommendation, comments } = req.body;

        if (!paperId || !responses || !recommendation) {
            res.status(400).json({ message: "Chýbajú povinné polia." });
            return;
        }

        // Check if a review already exists
        const existingReview = await Review.findOne({ paper: paperId, reviewer: reviewerId });
        if (existingReview) {
            res.status(400).json({ message: "Recenzia už existuje. Použite endpoint na aktualizáciu." });
            return;
        }

        // Save the review
        const newReview = new Review({
            paper: paperId,
            reviewer: reviewerId,
            responses,
            recommendation,
            comments,
        });
        await newReview.save();

        // Update paper status
        const paperStatus = getPaperStatusFromRecommendation(recommendation);
        await Paper.findByIdAndUpdate(paperId, { status: paperStatus });

        // Return the review with populated questions
        const populatedReview = await Review.findById(newReview._id)
          .populate("responses.question", "text"); // Populate question text

        res.status(201).json({ message: "Recenzia bola úspešne vytvorená.", review: populatedReview });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: "Nepodarilo sa vytvoriť recenziu.", error });
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

//Get review by ID
export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId, reviewerId } = req.params;

        const review = await Review.findOne({ paper: paperId, reviewer: reviewerId })
          .populate("responses.question", "text ");

        if (!review) {
            res.status(404).json({ message: "Recenzia nebola nájdená." });
            return;
        }

        res.status(200).json(review);
    } catch (error) {
        console.error("Error fetching review by ID:", error);
        res.status(500).json({ message: "Nepodarilo sa načítať recenziu.", error });
    }
};

//Review update
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
            res.status(404).json({ message: "Recenzent alebo práca nebola nájdená." });
            return;
        }

        const emailContent = `
            <p>Dobrý deň, ${reviewer.first_name},</p>
            <p>Bola vám pridelená práca "<strong>${paper.title}</strong>" na recenziu.</p>
            <p>Prihláste sa do svojho účtu, aby ste získali prístup k podrobnostiam.</p>
        `;

        await sendEmail({
            to: reviewer.email,
            subject: "Nová práca na recenziu",
            html: emailContent,
        });

        res.status(200).json({ message: "Recenzent bol úspešne upozornený." });
    } catch (error) {
        console.error("Error notifying reviewer:", error);
        res.status(500).json({ error: "Nepodarilo sa upozorniť recenzenta." });
    }
};

// Download assigned paper
export const downloadPaper = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const paperId = req.params.paperId;
        const paper = await Paper.findById(paperId);

        if (!paper || !paper.file_link) {
            res.status(404).json({ message: "Práca nebola nájdená alebo nemá priložený súbor." });
            return;
        }

        res.download(paper.file_link, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).json({ error: "Nepodarilo sa stiahnuť prácu." });
            }
        });
    } catch (error) {
        console.error("Error downloading paper:", error);
        res.status(500).json({ error: "Nepodarilo sa stiahnuť prácu." });
    }
};

// Contact admin
export const contactAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            res.status(400).json({ message: "Predmet a správa sú povinné." });
            return;
        }

        const admins = await User.find({ role: "admin" }).select("email");
        if (!admins.length) {
            res.status(404).json({ message: "Neboli nájdení žiadni administrátori." });
            return;
        }

        for (const admin of admins) {
            await sendEmail({
                to: admin.email,
                subject: `Dotaz recenzenta: ${subject}`,
                html: `<p>${message}</p>`,
            });
        }

        res.status(200).json({ message: "Správa bola úspešne odoslaná všetkým administrátorom." });
    } catch (error) {
        console.error("Error contacting admins:", error);
        res.status(500).json({ error: "Nepodarilo sa kontaktovať administrátorov." });
    }
};