import {body, param, validationResult} from 'express-validator';
import { Request, Response, NextFunction } from 'express';

//Validation rules for user registration
export const registerValidationRules = [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('university').notEmpty().withMessage('University is required'),
    body('role').notEmpty().withMessage('Role is required'),
];

//Validation rules for email verification
export const verifyEmailValidationRules = [
    param('token').notEmpty().withMessage('Verification token is required'),
];

//Validation rules for profile update
export const updateProfileValidationRules = [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('university').optional().notEmpty().withMessage('University cannot be empty'),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

//Middleware to check validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};