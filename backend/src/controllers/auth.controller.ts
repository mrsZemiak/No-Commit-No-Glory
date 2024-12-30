import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import {config} from "../config";
import User from '../models/User';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Verify password
        const isMatch = await argon2.verify(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT with userId and role
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        //Clear the refresh token
        //await User.findByIdAndUpdate(userId, { refreshToken: null });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Logout failed', error });
    }
};

/*
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body; //refresh tokens on login

        //Verify refresh token
        const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string };

        //Generate new token
        const newToken = jwt.sign(
            { userId: decoded.userId },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token', error });
    }
};
 */