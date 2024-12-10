import { Request, Response, NextFunction} from "express";

export const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { role } = req.body;
        if (!roles.includes(role)) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        next();
    };
};