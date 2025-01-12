import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Ensure the Authorization header exists and follows the Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token provided or invalid scheme' });
        return;
    }

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    try {
        // Verify the token and attach decoded data to req.user
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
};