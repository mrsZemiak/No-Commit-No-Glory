import {body, param, validationResult} from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role'

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

//Validation rules for admin to edit user status and role
export const validateEditUserDetails = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('status').optional().isIn(['new', 'active', 'suspended', 'inactive']).withMessage('Invalid status value'),
    body('role').optional().custom(async (value) => {
        const roleExists = await Role.findById(value);
        if (!roleExists) {
            throw new Error('Invalid role value');
        }
        return true;
    }),
    body('email').optional().isEmail().withMessage('Invalid email address'),
];

export const validateSubmitPaper = [
    body('title')
      .notEmpty()
      .withMessage('Title is required.')
      .isLength({ max: 200 })
      .withMessage('Title must be at most 200 characters.'),
    body('abstract')
      .notEmpty()
      .withMessage('Abstract is required.')
      .isLength({ max: 150 })
      .withMessage('Abstract must be at most 1000 characters.'),
    body('keywords')
      .isArray({ min: 1 })
      .withMessage('At least one keyword is required.')
      .custom((keywords: string[]) => keywords.every(k => true))
      .withMessage('Keywords must be an array of strings.'),
    body('file_link')
      .notEmpty()
      .withMessage('File link is required.')
      .isURL()
      .withMessage('File link must be a valid URL.'),
    body('category')
      .notEmpty()
      .withMessage('Category is required.')
      .isMongoId()
      .withMessage('Category must be a valid MongoDB ID.'),
    body('conference')
      .notEmpty()
      .withMessage('Conference is required.')
      .isMongoId()
      .withMessage('Conference must be a valid MongoDB ID.'),
    body('authors')
      .isArray({ min: 1 })
      .withMessage('At least one author is required.')
      .custom(authors =>
        authors.every(
          (author: { firstName: string; lastName: string }) =>
            true
        )
      )
      .withMessage('Each author must have a valid first name and last name.'),
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