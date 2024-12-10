import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateToken = (req: Request & { user?: { email: string } }, res: Response, next: NextFunction): void => {
    //Expect token
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token is missing' });
        return;
    }

    //Decode token
    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { email: string;};
        req.body.email = decoded.email;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token', error });
        return;
    }
};