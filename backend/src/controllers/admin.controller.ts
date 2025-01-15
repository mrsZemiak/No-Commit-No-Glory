import { Request, Response } from "express";
import AdmZip from "adm-zip";
import User from "../models/User";
import Conference, { ConferenceStatus } from "../models/Conference";
import { AuthRequest } from "../middleware/authenticateToken";
import Category from "../models/Category";
import Paper from "../models/Paper";
import Question from "../models/Question";
import path from "path";
import { promises as fs } from "fs";

/** USER S**/
//Get all users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Nepodarilo sa načítať používateľov', error });
  }
};

//Get user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("role");
    if (!user) {
      res.status(404).json({ message: "Používateľ nebol nájdený" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Nepodarilo sa načítať používateľa", error });
  }
};

//Manage user roles, status and email
export const editUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).populate("role");

    if (!updatedUser) {
      res.status(404).json({ message: "Používateľ nebol nájdený alebo sa nepodarilo aktualizovať" });
      return;
    }

    res.status(200).json({
      message: "Používateľské údaje boli úspešne aktualizované",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Chyba pri aktualizácii údajov používateľa", error });
  }
};

/** CATEGORIES **/
//Get all categories
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

//Get category by ID
export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Kategória nebola nájdená" });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({ message: "Nepodarilo sa načítať kategóriu", error });
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

//Update category
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

//Delete category
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

/** CONFERENCES **/
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

// Update existing conference (dynamic update)
export const updateConference = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conferenceId } = req.params;
    const updates = req.body;

    const updatedConference = await Conference.findByIdAndUpdate(conferenceId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedConference) {
      res.status(404).json({ message: "Konferencia nebola nájdená" });
      return;
    }

    res.status(200).json({ message: "Konferencia bola úspešne aktualizovaná", conference: updatedConference });
  } catch (error) {
    console.error("Error updating conference:", error);
    res.status(500).json({ message: "Nepodarilo sa aktualizovať konferenciu", error });
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

/** QUESTIONS **/
//Get all questions
export const getAllQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questions = await Question.find()
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error retrieving questions:', error);
    res.status(500).json({ message: 'Nepodarilo sa načítať otázky', error });
  }
};

//Get question by ID
export const getQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
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

//Create new question
export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, type, options, category } = req.body;

    if (!text || !type) {
      res.status(400).json({ message: 'Text a typ sú povinné polia' });
      return;
    }

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

// Update question (dynamic update)
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(questionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuestion) {
      res.status(404).json({ message: "Nepodarilo sa nájsť otázku" });
      return;
    }

    res.status(200).json({
      message: "Otázka bola úspešne aktualizovaná",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Nepodarilo sa aktualizovať otázku", error });
  }
};

/** PAPERS **/

//Get all papers grouped by conference
export const getPapersGroupedByConference = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fetch all conferences
    const conferences = await Conference.find().sort({ year: -1 });

    // Fetch papers for each conference and group them
    const groupedConferences = await Promise.all(
      conferences.map(async (conference) => {
        const papers = await Paper.find({ conference: conference._id })
          .populate('user', 'first_name last_name email').populate('category', 'name')
          .select('title user category deadline_date status file_link'); // Include only relevant fields

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
      res.status(400).json({ message: 'Je potrebný nový termín' });
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

//Assign reviewer to paper (dynamic update)
export const assignReviewer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paperId } = req.params;
    const updates = req.body; // Allows dynamic updates

    const updatedPaper = await Paper.findByIdAndUpdate(paperId, updates, {
      new: true,
      runValidators: true,
    }).populate("reviewer", "first_name last_name email");

    if (!updatedPaper) {
      res.status(404).json({ message: "Nepodarilo sa nájsť prácu" });
      return;
    }

    res.status(200).json({
      message: "Práca bola úspešne aktualizovaná",
      paper: updatedPaper,
    });
  } catch (error) {
    console.error("Error assigning reviewer:", error);
    res.status(500).json({ message: "Nepodarilo sa aktualizovať prácu", error });
  }
};

//Paper download grouped by conference
export const downloadPapersByConference = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conferenceId } = req.query;

    if (!conferenceId) {
      res.status(400).json({ message: "Je potrebné zadať ID konferencie." });
      return;
    }

    //Define the path where papers are stored
    const conferenceUploadPath = path.resolve(`uploads/docs/${conferenceId}`);

    //Check if the conference folder exists
    try {
      await fs.access(conferenceUploadPath);
    } catch (err) {
      res.status(404).json({ message: "Pre túto konferenciu neexistuje priečinok s prácami." });
      return;
    }

    //Read all files in the directory
    const files = await fs.readdir(conferenceUploadPath);
    if (files.length === 0) {
      res.status(404).json({ message: "Pre túto konferenciu neboli nájdené žiadne dokumenty." });
      return;
    }

    //Create ZIP archive
    const zip = new AdmZip();
    files.forEach((file) => {
      const filePath = path.join(conferenceUploadPath, file);
      zip.addLocalFile(filePath, "", file); // Add files to ZIP
    });

    //Headers for downloading the ZIP file
    const zipFileName = `conference-${conferenceId}-papers.zip`;
    res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);
    res.setHeader("Content-Type", "application/zip");

    const data = zip.toBuffer();
    res.status(200).end(data);
  } catch (error) {
    console.error("Error downloading papers for conference:", error);
    res.status(500).json({ message: "Nepodarilo sa stiahnuť práce.", error });
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

