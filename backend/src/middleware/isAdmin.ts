import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Role from '../models/Role';

// Middleware to check if user has admin role
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User is not authenticated' });
    }

    try {
        const { email } = req.user;

        // Fetch the user and their role
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = await Role.findById(user.role);
        if (!role || role.name !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};