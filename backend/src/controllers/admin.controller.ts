import { Request, Response } from 'express';
import AdmZip from 'adm-zip';
import User from '../models/User';
import Conference, { ConferenceStatus } from '../models/Conference'
import Category from '../models/Category';
import Paper from '../models/Paper'
import path from 'node:path'
import { promises as fs } from 'fs';
import Question from '../models/Question'

//Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa načítať používateľov', error });
    }
};

//Manage user roles, status, email
export const editUserDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, status, role, email } = req.body;

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

//
/*
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().sort({ name: 1 }); //sort alphabetically
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať kategórie', error });
    }
};
 */

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        // Parse query parameters
        const { limit = 10, page = 1 } = req.query;

        // Ensure limit and page are numbers
        const perPage = Math.max(Number(limit), 1); // Ensure limit is at least 1
        const currentPage = Math.max(Number(page), 1); // Ensure page is at least 1

        // Fetch categories with pagination
        const categories = await Category.find()
          .skip((currentPage - 1) * perPage) // Skip categories for previous pages
          .limit(perPage); // Limit the number of results

        // Get total count of categories
        const total = await Category.countDocuments();

        // Respond with paginated data
        res.status(200).json({
            categories,
            total, // Total number of categories
            currentPage,
            totalPages: Math.ceil(total / perPage), // Calculate total pages
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Nepodarilo sa načítať kategórie' });
    }
};

//Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({ message: 'Kategória bola úspešne vytvorená', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Chyba pri vytváraní kategórie', error });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
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

//Get all existing conferences
export const getAllConferences = async (_req: Request, res: Response): Promise<void> => {
    try {
        const conferences = await Conference.find();
        res.status(200).json(conferences);
    } catch (error) {
        console.error('Error fetching conferences:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať konferencie', error });
    }
};

//Create a new conference
export const createConference = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            year,
            location,
            university,
            start_date,
            end_date,
            deadline_submission,
            deadline_review,
            user,
        } = req.body;

        const newConference = new Conference({
            year,
            location,
            university,
            status: ConferenceStatus.Upcoming,
            start_date,
            end_date,
            deadline_submission,
            deadline_review,
            created_at: new Date(),
            user, //admin user created the conference
        });

        await newConference.save();
        res.status(201).json({ message: 'Konferencia bola úspešne vytvorená', conference: newConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Nepodarilo sa vytvoriť konferenciu', error });
    }
};

//Update existing conference
export const updateConference = async (req: Request, res: Response): Promise<void> => {
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

export const getAllQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať otázky', error });
    }
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
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

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { questionId } = req.params;
        const updates = req.body;

        //Find and update the question
        const updatedQuestion = await Question.findByIdAndUpdate(questionId, updates, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validations are run
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

//Get all papers
export const viewAllPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const papers = await Paper.find().populate('category', 'name').populate('conference', 'year location university status').populate('user', 'first_name last_name');
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa načítať práce', error });
    }
};

// View all papers grouped by conference
export const getPapersGroupedByConference = async (_req: Request, res: Response): Promise<void> => {
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
                  _id: conference._id,
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
export const changeSubmissionDeadline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paperId } = req.params;
        const { newDeadline } = req.body;

        if (!newDeadline) {
            res.status(400).json({ message: 'Je potrebný nový termín.' });
            return;
        }

        const updatedPaper = await Paper.findByIdAndUpdate(
          paperId,
          { submission_date: new Date(newDeadline) },
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
export const assignReviewer = async (req: Request, res: Response): Promise<void> => {
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
        );

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

export const downloadPapersByConference = async (req: Request, res: Response): Promise<void> => {
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
