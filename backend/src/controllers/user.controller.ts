import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { config } from '../config';
import { AuthRequest } from '../middleware/authenticateToken';
import { updateConferenceStatus } from '../middleware/updateStatus';
import User, { UserStatus } from '../models/User'
import Conference from '../models/Conference'
import Category from '../models/Category'
import path from 'node:path'

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
            host: config.emailHost,
            port: config.emailPort,
            secure: false, //true if port is 465, other are non-secure
            auth: { user: config.emailUser, pass: config.emailPass },
        } as nodemailer.TransportOptions);

        const verificationUrl = `${config.baseUrl}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: `"SciSubmit" <${config.emailUser}>`,
            to: email,
            subject: 'Verify Your Email',
            html:
              `<div style="position: relative; font-family: Arial, sans-serif; line-height: 1.6; color: #2C3531; background-color: #F7F7F7; padding: 20px; border: 1px solid #DDD; border-radius: 8px; max-width: 600px; margin: auto;">
            <!-- Logo Section -->
            <div style="text-align: center; margin: 0; padding: 0;">
                <img src="cid:scisubmit-logo" alt="SciSubmit Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
            </div>
            <!-- Content Section -->
            <h2 style="color: #116466; font-size: 24px; text-align: center;">Overte svoju e-mailovú adresu</h2>
            <p style="color: #2C3531; margin: 10px 0;">Dobrý deň,</p>
    <p style="color: #2C3531; margin: 10px 0;">Ďakujeme za registráciu! Kliknite na tlačidlo nižšie a overte svoju e-mailovú adresu:</p>
    <div style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" style="display: inline-block; background-color: #BC4639; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Verify Email</a>
    </div>
    
    <!-- Token Section -->
    <p style="color: #2C3531; margin: 10px 0;">Ak tlačidlo nefunguje, skopírujte a vložte nasledujúci odkaz do svojho prehliadača:</p>
    <p style="font-size: 10px; word-wrap: break-word; color: #116466;">${verificationUrl}</p>
     
    <hr style="border: none; border-top: 1px solid #DDD; margin: 20px 0;">
    <p style="font-size: 12px; color: #888; text-align: center;">Ak ste si účet nevytvorili, môžete tento e-mail ignorovať.</p>
</div>`,
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../assets/logo.png'), // Adjust the path to the actual location of your logo
                    cid: 'scisubmit-logo' // Same as referenced in the HTML
                }
            ]
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

        // Update user state to verified and status to active
        user.isVerified = true;
        user.status = UserStatus.Active;
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

        // Find the user by ID without populating the role
        const user = await User.findById(userId);
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

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId; // Extracted from token middleware

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized. Missing user information.' });
            return;
        }

        // Find the user by ID without populating the role
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Exclude fields email and role to prevent unauthorized modifications
        const updates = { ...req.body };
        delete updates.email;
        delete updates.role;

        // Update the user's profile
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
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

// Fetch all categories (accessible for dropdown selection)
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories', error });
    }
};

// Fetch all conferences (accessible for dropdown selection)
export const getAllConferences = async (_req: Request, res: Response): Promise<void> => {
    try {
        // Update statuses before fetching conferences
        await updateConferenceStatus();

        const conferences = await Conference.find().populate('categories');
        res.status(200).json(conferences);
    } catch (error) {
        console.error('Error fetching conferences:', error);
        res.status(500).json({ message: 'Failed to fetch conferences', error });
    }
};