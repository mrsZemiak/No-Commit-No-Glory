import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = '1h'; // Example: Tokens expire in 1 hour

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        //Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        //Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        //Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    res.status(200).json({ message: 'Logout successful' });
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body; //refresh tokens on login

        //Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

        //Generate new token
        const newToken = jwt.sign(
            { userId: decoded.userId },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.status(200).json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token', error });
    }
};