import { Request, Response } from 'express';
import User from '../models/User';
import Conference from '../models/Conference'
import Category from '../models/Category';
import Paper from "../models/Paper";


//Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find(); //.populate('role'); Oprav
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
};

//Manage user roles
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error });
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

//Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true }
        );
        if (!updatedCategory) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update category', error });
    }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        res.status(200).json({ message: 'Category deleted successfully', category: deletedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete category', error });
    }
};


//Get all conferences
export const getAllConferences = async (_req: Request, res: Response): Promise<void> => {
    try {
        const conferences = await Conference.find().populate('categories').populate('user');
        res.status(200).json(conferences);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch conferences', error });
    }
};

//Create a new conference
export const createConference = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received data:', req.body);
        const {
            year,
            location,
            university,
            status,
            start_date,
            end_date,
            categories,
            deadline_submission,
            deadline_review,
            user,
        } = req.body;

        const newConference = new Conference({
            year,
            location,
            university,
            status: status || 'upcoming', // Default to 'upcoming'
            start_date,
            end_date,
            categories,
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
//Get all papers
export const viewAllPapers = async (req: Request, res: Response): Promise<void> => {
    try {
        const papers = await Paper.find().populate('category', 'name').populate('conference', 'year location university status').populate('user', 'first_name last_name');
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch papers', error });
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


