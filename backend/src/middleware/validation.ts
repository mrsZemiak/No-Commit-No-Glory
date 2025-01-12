import {body, param, check, validationResult} from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role'
import Question from '../models/Question'

//Validation rules for user registration
export const registerValidationRules = [
    body('first_name').notEmpty().withMessage('Meno je povinné'),
    body('last_name').notEmpty().withMessage('Priezvisko je povinné'),
    body('email').isEmail().withMessage('Vyžaduje sa platný e-mail'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Heslo musí mať aspoň 6 znakov'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Heslá sa nezhodujú');
        }
        return true;
    }),
    body('university').notEmpty().withMessage('University is required'),
    body('role').notEmpty().withMessage('Rola je povinná'),
];

export const loginValidationRules = [
    body('email').isEmail().withMessage('Vyžaduje sa platný e-mail'),
    body('password').notEmpty().withMessage('Heslo je povinné'),
];


//Validation rules for email verification
export const verifyEmailValidationRules = [
    check('token', 'Verification token is required').exists().isString().withMessage('Token musí byť reťazec').bail().trim().escape(),
];

//Validation rules for profile update
export const updateProfileValidationRules = [
    body('first_name').optional().notEmpty().withMessage('Meno nemôže byť prázdne'),
    body('last_name').optional().notEmpty().withMessage('Priezvisko nemôže byť prázdne'),
    body('university').optional().notEmpty().withMessage('Univerzita nemôže byť prázdna'),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Heslo musí mať aspoň 6 znakov'),
];

//Validation rules for admin to edit user status and role
export const validateEditUserDetails = [
    body('userId').notEmpty().withMessage('Je potrebné zadať ID používateľa'),
    body('status').optional().isIn(['new', 'active', 'suspended', 'inactive']).withMessage('Neplatná hodnota pre status'),
    body('role').optional().custom(async (value) => {
        const roleExists = await Role.findById(value);
        if (!roleExists) {
            throw new Error('Neplatná hodnota pre rolu');
        }
        return true;
    }),
    body('email').optional().isEmail().withMessage('Neplatná e-mailová adresa'),
];

export const validateSubmitPaper = [
    body('title')
        .notEmpty()
        .withMessage('Názov je povinný.')
        .isLength({ max: 200 })
        .withMessage('Názov môže mať maximálne 200 znakov.'),
    body('abstract')
        .notEmpty()
        .withMessage('Abstrakt je povinný.')
        .isLength({ max: 150 })
        .withMessage('Abstrakt môže mať maximálne 1000 znakov.'),
    body('keywords')
        .isArray({ min: 1 })
        .withMessage('Je potrebné zadať aspoň jedno kľúčové slovo.')
        .custom((keywords: string[]) => keywords.every(k => true))
        .withMessage('Kľúčové slová musia byť pole reťazcov.'),
    body('file_link')
        .notEmpty()
        .withMessage('Odkaz na súbor je povinný.')
        .isURL()
        .withMessage('Odkaz na súbor musí mať platnú URL adresu.'),
    body('category')
        .notEmpty()
        .withMessage('Kategória je povinná.')
        .isMongoId()
        .withMessage('Kategória musí mať platné MongoDB ID.'),
    body('conference')
        .notEmpty()
        .withMessage('Konferencia je povinná.')
        .isMongoId()
        .withMessage('Konferencia musí mať platné MongoDB ID.'),
    body('authors')
        .isArray({ min: 1 })
        .withMessage('Je potrebné zadať aspoň jedného autora.')
        .custom(authors =>
            authors.every(
                (author: { firstName: string; lastName: string }) =>
                    true
            )
        )
        .withMessage('Každý autor musí mať platné meno a priezvisko.'),
];


export const validateReviewSubmission = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const { paper, reviewer, responses, recommendation, comments } = req.body;

        //Ensure all required fields are provided
        if (!paper || !reviewer || !responses || !recommendation) {
            res.status(400).json({ message: 'Chýbajú povinné polia' });
            return;
        }

        //Validate recommendation value
        const validRecommendations = ['publish', 'publish_with_changes', 'reject'];
        if (!validRecommendations.includes(recommendation)) {
            res.status(400).json({ message: 'Neplatná hodnota pre odporúčanie' });
            return;
        }

        //Validate responses
        for (const response of responses) {
            const question = await Question.findById(response.question);
            if (!question) {
                res.status(400).json({ message: `Neplatné ID otázky: ${response.question}` });
                return;
            }

            switch (question.type) {
                case 'rating':
                    if (typeof response.answer !== 'number' || response.answer < question.options!.min || response.answer > question.options!.max) {
                        res.status(400).json({ message: `Neplatné hodnotenie pre otázku s ID: ${response.question}` });
                        return;
                    }
                    break;
                case 'yes_no':
                    if (response.answer !== 'yes' && response.answer !== 'no') {
                        res.status(400).json({ message: `Neplatná Áno/Nie odpoveď pre otázku s ID: ${response.question}` });
                        return;
                    }
                    break;
                case 'text':
                    if (typeof response.answer !== 'string') {
                        res.status(400).json({ message: `Neplatná textová odpoveď pre otázku s ID: ${response.question}` });
                        return;
                    }
                    break;
                default:
                    res.status(400).json({ message: `Neplatný typ otázky pre otázku s ID: ${response.question}` });
                    return;
            }
        }

        //If all validations pass, move to the next middleware/controller
        next();
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ message: 'Chyba pri validácii', error });
    }
};

//Middleware to check validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};