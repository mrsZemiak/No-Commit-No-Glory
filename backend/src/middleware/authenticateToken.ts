import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { config } from '../config';

export interface AuthRequest extends Request {
    user?: { userId: string; role: string; };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Ensure the Authorization header exists and follows the Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Neautorizované: Nebol poskytnutý token alebo je neplatná schéma' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Neautorizované: Nebol poskytnutný token' });
        return;
    }

    try {
        // Verify the token and attach decoded data to req.user
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        if (error instanceof TokenExpiredError) {
            // Token expired
            res.status(401).json({ message: 'Token expired', expiredAt: error.expiredAt });
            return;
        } else if (error instanceof JsonWebTokenError) {
            // Other JWT-related errors
            res.status(403).json({ message: 'Forbidden: Invalid or malformed token' });
            return;
        }

        // Any other JWT-related error
        res.status(403).json({ message: 'Zakázané: Neplatný alebo expirovaný token' });
    }
};