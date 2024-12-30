import { Request, Response } from 'express';
import AdmZip from 'adm-zip';
import User from '../models/User';
import Conference, { ConferenceStatus } from '../models/Conference'
import Category from '../models/Category';
import Paper from '../models/Paper'
import path from 'node:path'
import { promises as fs } from 'fs';

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

// View all papers grouped by conference
export const getPapersGroupedByConference = async (_req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all conferences
        const conferences = await Conference.find().sort({ year: -1 });

        // Fetch papers for each conference and group them
        const groupedConferences = await Promise.all(
          conferences.map(async (conference) => {
              const papers = await Paper.find({ conference: conference._id })
                .populate('user', 'firstName lastName email') // Include user info
                .select('title user'); // Include only relevant fields

              return {
                  _id: conference._id,
                  year: conference.year,
                  date: conference.date,
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
        const { conferenceId } = req.params;

        // Fetch all papers for the specified conference
        const papers = await Paper.find({ conference: conferenceId }, 'file_link');
        if (!papers.length) {
            res.status(404).json({ message: 'No papers found for this conference.' });
            return;
        }

        // Create a ZIP file and add the files
        const zip = new AdmZip();
        for (const paper of papers) {
            if (paper.file_link) {
                try {
                    const filePath = path.resolve(paper.file_link);
                    await fs.access(filePath);
                    zip.addLocalFile(filePath, '', `${paper._id}.pdf`);
                } catch (err) {
                    console.warn(`File not found or inaccessible: ${paper.file_link}`);
                }
            }
        }

        // Send ZIP file as a response
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
