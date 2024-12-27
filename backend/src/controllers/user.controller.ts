import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { config } from '../config';
import { AuthRequest } from '../middleware/authenticateToken';
import User from '../models/User';
import {IRole} from "../models/Role";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password, university, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Add user to database
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            university,
            role,
            isVerified: false, // Initial verification state
        });

        await newUser.save();

        // Generate JWT for email verification using userId
        const verificationToken = jwt.sign({ userId: newUser._id }, config.jwtSecret, { expiresIn: '1h' });

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: config.emailUser, pass: config.emailPass },
        });

        const verificationUrl = `${config.baseUrl}/verify-email/${verificationToken}`;
        await transporter.sendMail({
            from: config.emailUser,
            to: email,
            subject: 'Verify your Email',
            html: `<p>Click the link below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`,
        });

        res.status(201).json({
            message: 'User registered successfully. Check your email for verification.',
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.', error });
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

        // Find user by userId
        const user = await User.findById(decoded.userId);
        if (!user || user.isVerified) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        // Update user state to verified
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Email verification failed', error });
    }
};


export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId; // Extracted from token middleware

        // Find the user and populate the `role` field
        const user = await User.findById(userId).populate('role');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving profile:', error);
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body; // Email is required for identifying the user
        if (!email) {
            res.status(401).json({ message: 'Unauthorized. No email provided.' });
            return;
        }

        // Fetch the user and populate the `role` field
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Check for permissions
        if (!(user.role as IRole).permissions.includes('manage_profile')) {
            res.status(403).json({ message: 'You do not have permission to update your profile' });
            return;
        }

        // Exclude email and role from updates to prevent modification
        const updates = { ...req.body };
        delete updates.email;
        delete updates.role;

        // Update user's profile
        const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'Failed to update profile' });
            return;
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error });
    }
};