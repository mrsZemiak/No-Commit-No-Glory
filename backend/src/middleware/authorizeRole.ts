import { Response, NextFunction} from "express";
import { AuthRequest } from './authenticateToken';

export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Prístup zamietnutý' });
            return;
        }
        next();
    };
};