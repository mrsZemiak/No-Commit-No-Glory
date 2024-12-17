import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};