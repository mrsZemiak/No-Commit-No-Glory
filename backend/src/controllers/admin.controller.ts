import { Request, Response } from 'express';
import AdmZip from 'adm-zip';
import User from '../models/User';
import Conference, { ConferenceStatus } from '../models/Conference'
import { AuthRequest } from '../middleware/authenticateToken'
import Category from '../models/Category';
import Paper from '../models/Paper'
import path from 'node:path'
import { promises as fs } from 'fs';
import Question from '../models/Question'
import Review from '../models/Review'


//Get all users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa načítať používateľov', error });
    }
};

//Manage user roles, status, email
export const editUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, role, email } = req.body;
        const userId = req.params.userId;

        const updates: Partial<{ status: string; role: string; email: string }> = {};
        if (status) updates.status = status;
        if (role) updates.role = role;
        if (email) updates.email = email;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).populate('role');
        if (!updatedUser) {
            res.status(404).json({ message: 'Používateľ nebol nájdený alebo sa nepodarilo aktualizovať' });
            return;
        }

        res.status(200).json({
            message: 'Používateľské údaje boli úspešne aktualizované',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Chyba pri aktualizácii údajov používateľa', error });
    }
};

export const getAllCategories = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch all categories
        const categories = await Category.find();

        res.status(200).json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Nepodarilo sa načítať kategórie' });
    }
};

//Create a new category
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({ message: 'Kategória bola úspešne vytvorená', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Chyba pri vytváraní kategórie', error });
    }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const updates = req.body;

        // Validate input
        if (!categoryId || !updates || Object.keys(updates).length === 0) {
            res.status(400).json({ message: 'Neplatná požiadavka. Je potrebné zadať ID kategórie a údaje na aktualizáciu.' });
            return;
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });
        if (!updatedCategory) {
            res.status(404).json({ message: 'Kategória nebola nájdená.' });
            return;
        }

        res.status(200).json({
            message: 'Kategória bola úspešne aktualizovaná',
            category: updatedCategory,
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Nepodarilo sa aktualizovať kategóriu', error });
    }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params; // Use "categoryId" to match the route

        const deletedCategory = await Category.findByIdAndDelete(categoryId); // Use "categoryId"
        if (!deletedCategory) {
            res.status(404).json({ message: 'Kategória nebola nájdená' });
            return;
        }

        res.status(200).json({ message: 'Kategória bola úspešne vymazaná', category: deletedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Nepodarilo sa vymazať kategóriu', error });
    }
};


//Get all existing conferences
export const getAllConferences = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const conferences = await Conference.find();
        res.status(200).json(conferences);
    } catch (error) {
        console.error('Error fetching conferences:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať konferencie', error });
    }
};

//Create a new conference
export const createConference = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            year,
            date,
            location,
            university,
            start_date,
            end_date,
            deadline_submission,
            deadline_review,
        } = req.body;

        const newConference = new Conference({
            year,
            date,
            location,
            university,
            status: ConferenceStatus.Upcoming,
            start_date,
            end_date,
            deadline_submission,
            deadline_review,
            created_at: new Date(),
        });

        await newConference.save();

        // Create directory for the conference
        const uploadPath = `uploads/docs/${newConference._id}`;
        await fs.mkdir(uploadPath, { recursive: true });

        res.status(201).json({ message: 'Konferencia bola úspešne vytvorená', conference: newConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Nepodarilo sa vytvoriť konferenciu', error });
    }
};

export const getConferenceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const conference = await Conference.findById(id);
        if (!conference) {
            res.status(404).json({ message: "Conference not found." });
            return;
        }
        res.status(200).json(conference);
    } catch (error) {
        console.error("Error fetching conference:", error);
        res.status(500).json({ error: "Failed to fetch conference." });
    }
};

//Update existing conference
export const updateConference = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { conferenceId } = req.params;
        const updates = req.body;

        const updatedConference = await Conference.findByIdAndUpdate(conferenceId, updates, { new: true });
        if (!updatedConference) {
            res.status(404).json({ message: 'Konferencia nebola nájdená' });
            return;
        }

        res.status(200).json({ message: 'Konferencia bola úspešne aktualizovaná', conference: updatedConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Nepodarilo sa aktualizovať konferenciu', error });
    }
};

/*
//Delete conference
export const deleteConference = async (req: Request, res: Response): Promise<void> => {
    try {
        const { conferenceId } = req.params;

        const deletedConference = await Conference.findByIdAndDelete(conferenceId);
        if (!deletedConference) {
            res.status(404).json({ message: 'Konferencia nebola nájdená' });
            return;
        }

        res.status(200).json({ message: 'Konferencia bola úspešne vymazaná', conference: deletedConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Nepodarilo sa vymazať konferenciu', error });
    }
};
 */

export const getAllQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const questions = await Question.find()
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať otázky', error });
    }
};

export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const question = await Question.findById(id);
        if (!question) {
            res.status(404).json({ message: "Question not found." });
            return;
        }

        res.status(200).json(question);
    } catch (error) {
        console.error("Error fetching question by ID:", error);
        res.status(500).json({ message: "Failed to fetch question.", error });
    }
};

export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { text, type, options, category } = req.body;

        // Validate required fields
        if (!text || !type) {
            res.status(400).json({ message: 'Text a typ sú povinné polia' });
            return;
        }

        // Create and save the question
        const newQuestion = new Question({ text, type, options, category });
        await newQuestion.save();

        res.status(201).json({
            message: 'Otázka bola úspešne vytvorená',
            question: newQuestion,
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Nepodarilo sa vytvoriť otázku', error });
    }
};

export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { questionId } = req.params;
        const updates = req.body;
        //Find and update the question
        const updatedQuestion = await Question.findByIdAndUpdate(questionId, updates, {
            new: true,
            runValidators: true,
        });
        if (!updatedQuestion) {
            res.status(404).json({ message: 'Nepodarilo sa nájsť otázku' });
            return;
        }
        res.status(200).json({
            message: 'Otázka bola úspešne aktualizovaná',
            question: updatedQuestion,
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Nepodarilo sa aktualizovať otázku', error });
    }
};

// View all papers grouped by conference
export const getPapersGroupedByConference = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Fetch all conferences
        const conferences = await Conference.find().sort({ year: -1 });

        // Fetch papers for each conference and group them
        const groupedConferences = await Promise.all(
          conferences.map(async (conference) => {
              const papers = await Paper.find({ conference: conference._id })
                .populate('user').populate('category')
                .select('title status submission_date user category'); // Include only relevant fields

              return {
                  year: conference.year,
                  date: conference.date,
                  location: conference.location,
                  papers,
              };
          })
        );

        res.status(200).json(groupedConferences);
    } catch (error) {
        console.error('Error fetching grouped papers:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať zoskupené práce.', error });
    }
};

// Change submission deadline of particular paper
export const changeSubmissionDeadline = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId } = req.params;
        const { newDeadline } = req.body;

        if (!newDeadline) {
            res.status(400).json({ message: 'Je potrebný nový termín.' });
            return;
        }
        const updatedPaper = await Paper.findByIdAndUpdate(
          paperId,
          { deadline_date: new Date(newDeadline) },
          { new: true }
        );
        if (!updatedPaper) {
            res.status(404).json({ message: 'Nepodarilo sa nájsť prácu' });
            return;
        }

        res.status(200).json({ message: 'Termín odovzdania bol úspešne aktualizovaný', paper: updatedPaper });
    } catch (error) {
        console.error('Error updating submission deadline:', error);
        res.status(500).json({ message: 'Nepodarilo sa aktualizovať termín odovzdania', error });
    }
};

// Assign a reviewer to a paper
export const assignReviewer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId } = req.params;
        const { reviewerId } = req.body;

        // Check if the reviewer exists
        const reviewer = await User.findById(reviewerId);
        if (!reviewer) {
            res.status(404).json({ message: 'Nepodarilo sa nájsť recenzenta.' });
            return;
        }

        // Update the paper with the reviewer
        const updatedPaper = await Paper.findByIdAndUpdate(
          paperId,
          { reviewer: reviewerId },
          { new: true }
        ).populate('reviewer', 'first_name last_name email');

        if (!updatedPaper) {
            res.status(404).json({ message: 'Nepodarilo sa nájsť prácu.' });
            return;
        }

        res.status(200).json({
            message: 'Recenzent bol úspešne pridelený',
            paper: updatedPaper,
        });
    } catch (error) {
        console.error('Error assigning reviewer:', error);
        res.status(500).json({ message: 'Nepodarilo sa prideliť recenzenta', error });
    }
};

export const downloadPapersByConference = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { conferenceId } = req.query;

        if (!conferenceId) {
            res.status(400).json({ message: 'Je potrebné zadať ID konferencie.' });
            return;
        }

        // Fetch all papers for the specified conference
        const papers = await Paper.find({ conference: conferenceId }, 'file_link');
        if (!papers.length) {
            res.status(404).json({ message: 'Pre túto konferenciu neboli nájdené žiadne dokumenty.' });
            return;
        }

        // Create a new ZIP archive
        const zip = new AdmZip();

        // Add each file to the ZIP
        for (const paper of papers) {
            if (paper.file_link) {
                try {
                    const filePath = path.resolve(paper.file_link);
                    await fs.access(filePath); // Check if the file exists
                    zip.addLocalFile(filePath, '', `${paper._id}.pdf`);
                } catch (err) {
                    console.warn(`File not found or inaccessible: ${paper.file_link}`);
                }
            }
        }

        // Check if ZIP archive contains files
        if (zip.getEntries().length === 0) {
            res.status(404).json({ message: 'Nenašli sa žiadne platné súbory na stiahnutie.' });
            return;
        }

        // Set headers for downloading the ZIP file
        const zipFileName = `conference-${conferenceId}-papers.zip`;
        res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
        res.setHeader('Content-Type', 'application/zip');

        const data = zip.toBuffer();
        res.status(200).end(data);
    } catch (error) {
        console.error('Error downloading papers for conference:', error);
        res.status(500).json({ message: 'Nepodarilo sa stiahnuť práce.', error });
    }
};

// Admin Reports Controller
export const getAdminReports = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Total Papers Count
        const totalPapers = await Paper.countDocuments();

        // Papers Grouped by Status
        const papersByStatus = await Paper.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Papers by Category
        const papersByCategory = await Paper.aggregate([
            { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "categoryInfo" } },
            { $unwind: "$categoryInfo" },
            { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } }
        ]);

        // Active Reviewers Count
        const activeReviewers = await User.countDocuments({ role: "reviewer", status: "active" });

        // Papers Under Review
        const papersUnderReview = await Paper.countDocuments({ status: "under_review" });

        // Conferences with their Paper Counts
        const conferencesWithPaperCounts = await Conference.aggregate([
            { $lookup: { from: "papers", localField: "_id", foreignField: "conference", as: "papers" } },
            { $project: { _id: 1, name: 1, year: 1, paperCount: { $size: "$papers" } } }
        ]);

        // Send aggregated report data
        res.status(200).json({
            totalPapers,
            papersByStatus,
            papersByCategory,
            activeReviewers,
            papersUnderReview,
            conferencesWithPaperCounts
        });
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        res.status(500).json({ message: "Failed to fetch admin reports.", error });
    }
};

// Fetch new reviews
export const getAdminNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lastCheck = req.user?.last_login;

        // Count new papers
        const newPapers = await Paper.countDocuments({
            created_at: { $gte: lastCheck },
            status: "submitted",
        });

        // Count new users
        const newUsers = await User.countDocuments({ created_at: { $gte: lastCheck } });

        // Count new reviews
        const newReviews = await Review.countDocuments({
            created_at: { $gte: lastCheck },
        });

        res.status(200).json({
            newPapers,
            newUsers,
            newReviews,
        });
    } catch (error) {
        console.error("Error fetching admin notifications:", error);
        res.status(500).json({ message: "Failed to fetch admin notifications.", error });
    }
};

/*
export const markNotificationsAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const admin = req.user; // Fetch admin user
        admin.last_notification_check = new Date();
        await admin.save();
        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ message: "Failed to mark notifications as read" });
    }
};
 */
