import { Response } from "express";
import Review from "../models/Review";
import Paper, { IPaper, PaperStatus } from '../models/Paper'
import { AuthRequest } from "../middleware/authenticateToken";
import { sendEmail } from "../utils/emailService";
import User from "../models/User";
import Question from "../models/Question";
import path from "path";
import fs from "fs/promises";

//Assigned papers
export const getAssignedPapers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reviewerId = req.user?.userId;
    if (!reviewerId) {
      res
        .status(401)
        .json({ message: "Neautorizované. Recenzent nie je prihlásený." });
      return;
    }

    const pendingPapers = await Paper.find({
      reviewer: reviewerId,
      _id: { $nin: await Review.find({ reviewer: reviewerId, isDraft: false }).distinct('paper') }
    })
      .populate('category', 'name')
      .populate('conference', 'year location date');

    if (!pendingPapers.length) {
      res
        .status(404)
        .json({ message: "Žiadne práce pridelené tomuto recenzentovi." });
      return;
    }

    res.status(200).json(pendingPapers);
  } catch (error) {
    console.error("Error fetching assigned papers:", error);
    res.status(500).json({ error: "Nepodarilo sa načítať pridelené práce." });
  }
};

//Get all reviews for a specific reviewer
export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user?.userId;

    if (!reviewerId) {
      res.status(400).json({ message: 'Reviewer ID is required.' });
      return;
    }

    // Fetch all reviews by this reviewer
    const reviews = await Review.find({ reviewer: reviewerId })
      .populate({
        path: 'paper',
        select: 'title category conference abstract keywords authors',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'conference', select: 'year location date' },
        ],
      })
      .populate('responses.question', 'text') // Populate question text
      .sort({ created_at: -1 }); // Sort by most recent

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};

//Get all questions
export const getQuestions = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
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

// Create or submit review
export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log("Received Payload:", req.body);
    const { paper, reviewer, responses, recommendation, comments, isDraft } = req.body;

    if (!paper) {
      res.status(400).json({ message: 'Chýbajú povinné polia.' });
      return;
    }

    // Check if a review already exists
    const existingReview = await Review.findOne({
      paper: paper,
      reviewer: reviewer,
    });

    if (existingReview) {
      // Update the existing review
      existingReview.responses = responses;
      existingReview.recommendation = recommendation;
      existingReview.comments = comments;
      existingReview.isDraft = isDraft;
      await existingReview.save();

      // Update paper status if not a draft
      if (!isDraft) {
        const paperStatus = getPaperStatusFromRecommendation(recommendation);
        await Paper.findByIdAndUpdate(paper, { status: paperStatus });
      }

      res.status(200).json({ message: 'Recenzia bola úspešne aktualizovaná.', review: existingReview });
      return;
    }

    // Create a new review
    const newReview = new Review({
      paper: paper,
      reviewer: reviewer,
      responses,
      recommendation,
      comments: comments || '',
      isDraft,
    });
    await newReview.save();

    // Update paper status if not a draft
    if (!isDraft) {
      const paperStatus = getPaperStatusFromRecommendation(recommendation);
      await Paper.findByIdAndUpdate(paper, { status: paperStatus });
    }

    res.status(201).json({ message: 'Recenzia bola úspešne vytvorená.', review: newReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Nepodarilo sa uložiť recenziu.' });
  }
};

const getPaperStatusFromRecommendation = (
  recommendation: string,
): PaperStatus => {
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

export const appendReview = async (req: AuthRequest,
                                   res: Response,): Promise<void> => {
  const { paperId } = req.params;
  const { reviewId } = req.body;

  try {
    const paper = await Paper.findByIdAndUpdate(
      paperId,
      { $push: { review: reviewId } },
      { new: true }
    );

    if (!paper) {
      res.status(404).json({ message: 'Paper not found' });
      return
    }

    res.status(200).json({ message: 'Review appended to paper', paper });
  } catch (error) {
    console.error('Error appending review to paper:', error);
    res.status(500).json({ message: 'Failed to append review to paper' });
  }
}

//Get only submitted reviews
export const getSubmittedReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user?.userId;

    if (!reviewerId) {
      res.status(400).json({ message: 'Reviewer ID is required.' });
      return;
    }

    // Fetch only submitted reviews by the reviewer
    const submittedReviews = await Review.find({ reviewer: reviewerId, isDraft: false })
      .populate({
        path: 'paper',
        select: 'title category conference abstract keywords authors submission_date',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'conference', select: 'year location date' },
        ],
      })
      .populate('responses.question', 'text')
      .sort({ created_at: -1 }); //Sort by most recent

    res.status(200).json(submittedReviews);
  } catch (error) {
    console.error('Error fetching submitted reviews:', error);
    res.status(500).json({ message: 'Failed to fetch submitted reviews.' });
  }
};

//Get review by ID
export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      res.status(400).json({ message: 'Review ID is required.' });
      return;
    }

    const review = await Review.findById(reviewId).populate('paper', 'title category conference').populate('responses.question', 'text');
    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    res.status(200).json(review);
  } catch (err) {
    console.error('Error fetching review by ID:', err);
    res.status(500).json({ message: 'Failed to fetch review.' });
  }
};

// Notify reviewer about assigned paper
export const notifyReviewer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { reviewerId, paperId } = req.body;

    const reviewer = await User.findById(reviewerId);
    const paper = await Paper.findById(paperId);

    if (!reviewer || !paper) {
      res
        .status(404)
        .json({ message: "Recenzent alebo práca nebola nájdená." });
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

//Download assigned paper
export const downloadPaper = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const paperId = req.params.paperId;
    const paper = await Paper.findById(paperId);

    if (!paper || !paper.file_link) {
      res
        .status(404)
        .json({ message: "Práca nebola nájdená alebo nemá priložený súbor." });
      return;
    }

    //Resolve the file path to ensure it is absolute
    const filePath = path.resolve(paper.file_link);

    //Check if the file exists and is accessible
    try {
      await fs.access(filePath);
    } catch (err) {
      console.error("File not found or inaccessible:", err);
      res
        .status(404)
        .json({ message: "Súbor neexistuje alebo nie je dostupný." });
      return;
    }

    //Send the file to the client
    res.download(filePath, (err) => {
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

//Contact admin
export const contactAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      res.status(400).json({ message: "Predmet a správa sú povinné." });
      return;
    }

    const admins = await User.find({ role: "admin" }).select("email");
    if (!admins.length) {
      res
        .status(404)
        .json({ message: "Neboli nájdení žiadni administrátori." });
      return;
    }

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Dotaz recenzenta: ${subject}`,
        html: `<p>${message}</p>`,
      });
    }

    res
      .status(200)
      .json({
        message: "Správa bola úspešne odoslaná všetkým administrátorom.",
      });
  } catch (error) {
    console.error("Error contacting admins:", error);
    res
      .status(500)
      .json({ error: "Nepodarilo sa kontaktovať administrátorov." });
  }
};
