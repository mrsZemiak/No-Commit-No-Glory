import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {IRole} from "../models/Role";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password, university, role } = req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return; // End function execution
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Generate verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

        //Add user to database
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            university,
            role,
            verificationToken,
        });

        await newUser.save();

        //Send verification email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Click the link below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`,
        });

        res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };

        //Find user
        const user = await User.findOne({ email: decoded.email, verificationToken: token });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        //Update user state to verified
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        res.status(500).json({ message: 'Email verification failed', error });
    }
};


export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body; //Get email from the authenticated token
        if (!email) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        //Fetch user profile from the database
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body; // Email from the token (via authenticateToken middleware)

        //Find user and populate role
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        //Check if user has permission
        if (!(user.role as IRole).permissions.includes('manage_profile')) {
            res.status(403).json({ message: 'You do not have permission to update your profile' });
            return;
        }

        //Exclude email and role from updates to prevent modification
        const updates = { ...req.body };
        delete updates.email;
        delete updates.role;

        //Update user's profile
        const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User update failed' });
            return;
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};