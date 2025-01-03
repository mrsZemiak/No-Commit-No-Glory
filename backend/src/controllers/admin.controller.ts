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
        res.status(500).json({ message: 'Failed to fetch users', error });
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
            res.status(404).json({ message: 'User not found or failed to update.' });
            return;
        }

        res.status(200).json({
            message: 'User details updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Error updating user details', error });
    }
};

//
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().sort({ name: 1 }); //sort alphabetically
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories', error });
    }
};
//Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({ message: 'Category created successfully', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create category', error });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const updates = req.body;

        // Validate input
        if (!categoryId || !updates || Object.keys(updates).length === 0) {
            res.status(400).json({ message: 'Invalid request. Category ID and updates are required.' });
            return;
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });
        if (!updatedCategory) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }

        res.status(200).json({
            message: 'Category updated successfully',
            category: updatedCategory,
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Failed to update category', error });
    }
};

//Get all existing conferences
export const getAllConferences = async (_req: Request, res: Response): Promise<void> => {
    try {
        const conferences = await Conference.find();
        res.status(200).json(conferences);
    } catch (error) {
        console.error('Error fetching conferences:', error);
        res.status(500).json({ message: 'Failed to fetch conferences', error });
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
        res.status(201).json({ message: 'Conference created successfully', conference: newConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create conference', error });
    }
};

//Update existing conference
export const updateConference = async (req: Request, res: Response): Promise<void> => {
    try {
        const { conferenceId } = req.params;
        const updates = req.body;

        const updatedConference = await Conference.findByIdAndUpdate(conferenceId, updates, { new: true });
        if (!updatedConference) {
            res.status(404).json({ message: 'Conference not found' });
            return;
        }

        res.status(200).json({ message: 'Conference updated successfully', conference: updatedConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update conference', error });
    }
};

/*
//Delete conference
export const deleteConference = async (req: Request, res: Response): Promise<void> => {
    try {
        const { conferenceId } = req.params;

        const deletedConference = await Conference.findByIdAndDelete(conferenceId);
        if (!deletedConference) {
            res.status(404).json({ message: 'Conference not found' });
            return;
        }

        res.status(200).json({ message: 'Conference deleted successfully', conference: deletedConference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete conference', error });
    }
};
 */

export const getAllQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ message: 'Error retrieving questions', error });
    }
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text, type, options, category } = req.body;

        // Validate required fields
        if (!text || !type) {
            res.status(400).json({ message: 'Text and type are required fields' });
            return;
        }

        // Create and save the question
        const newQuestion = new Question({ text, type, options, category });
        await newQuestion.save();

        res.status(201).json({
            message: 'Question created successfully',
            question: newQuestion,
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Error creating question', error });
    }
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { questionId } = req.params;
        const updates = req.body;

        // Find and update the question
        const updatedQuestion = await Question.findByIdAndUpdate(questionId, updates, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validations are run
        });

        if (!updatedQuestion) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }

        res.status(200).json({
            message: 'Question updated successfully',
            question: updatedQuestion,
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Error updating question', error });
    }
};

//Get all papers
export const viewAllPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const papers = await Paper.find().populate('category', 'name').populate('conference', 'year location university status').populate('user', 'first_name last_name');
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch papers', error });
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
        res.status(500).json({ message: 'Failed to fetch grouped papers.', error });
    }
};

// Change submission deadline of particular paper
export const changeSubmissionDeadline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paperId } = req.params;
        const { newDeadline } = req.body;

        if (!newDeadline) {
            res.status(400).json({ message: 'New deadline is required.' });
            return;
        }

        const updatedPaper = await Paper.findByIdAndUpdate(
          paperId,
          { submission_date: new Date(newDeadline) },
          { new: true }
        );

        if (!updatedPaper) {
            res.status(404).json({ message: 'Paper not found.' });
            return;
        }

        res.status(200).json({ message: 'Submission deadline updated successfully', paper: updatedPaper });
    } catch (error) {
        console.error('Error updating submission deadline:', error);
        res.status(500).json({ message: 'Failed to update submission deadline', error });
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
            res.status(404).json({ message: 'Reviewer not found.' });
            return;
        }

        // Update the paper with the reviewer
        const updatedPaper = await Paper.findByIdAndUpdate(
          paperId,
          { reviewer: reviewerId },
          { new: true }
        );

        if (!updatedPaper) {
            res.status(404).json({ message: 'Paper not found.' });
            return;
        }

        res.status(200).json({
            message: 'Reviewer assigned successfully',
            paper: updatedPaper,
        });
    } catch (error) {
        console.error('Error assigning reviewer:', error);
        res.status(500).json({ message: 'Failed to assign reviewer', error });
    }
};

export const downloadPapersByConference = async (req: Request, res: Response): Promise<void> => {
    try {
        const { conferenceId } = req.query;

        if (!conferenceId) {
            res.status(400).json({ message: 'Conference ID is required.' });
            return;
        }

        // Fetch all papers for the specified conference
        const papers = await Paper.find({ conference: conferenceId }, 'file_link');
        if (!papers.length) {
            res.status(404).json({ message: 'No papers found for this conference.' });
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
            res.status(404).json({ message: 'No valid files to download.' });
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
        res.status(500).json({ message: 'Failed to download papers.', error });
    }
};
