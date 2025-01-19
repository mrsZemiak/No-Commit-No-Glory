import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { config } from '../config';
import { AuthRequest } from '../middleware/authenticateToken';
import User, { UserStatus } from '../models/User'
import { generateVerificationEmail, sendEmail } from '../utils/emailService'
import fs from 'fs';
import path from 'path';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, password, university, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already registered." });
      return;
    }

    //Hash password
    const hashedPassword = await argon2.hash(password);

    //Determine initial status
    const status = role === "admin" ? UserStatus.Pending : UserStatus.Inactive;

    //Create new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      university,
      role,
      isVerified: false,
      status,
    });

    // Generate JWT for email verification
    const verificationToken = jwt.sign({ userId: newUser._id }, config.jwtSecret, { expiresIn: "1h" });

    newUser.verificationToken = verificationToken;

    await newUser.save();

    //Send verification email
    const verificationUrl = `${config.baseUrl}/api/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: generateVerificationEmail(verificationUrl),
    });

    res.status(201).json({ message: "User registered successfully. Check your email for verification." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user.", error });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token as string, config.jwtSecret) as { userId: string };
    const user = await User.findOne({ _id: decoded.userId, verificationToken: token });

    if (!user) {
      return res.redirect(`${config.baseFrontendUrl}/email-verified-failure`);
    }

    if (user.isVerified) {
      return res.redirect(`${config.baseFrontendUrl}/email-verified-already`);
    }

    // Update user verification status
    user.isVerified = true;
    user.status = user.role !== "admin" ? UserStatus.Active : UserStatus.Pending;
    user.verificationToken = null; // Clear the token
    await user.save();

    res.redirect(`${config.baseFrontendUrl}/email-verified-success`);
  } catch (error) {
    if (error === 'TokenExpiredError') {
      // Token expired, suggest requesting a new verification link
      res.status(400).json({
        message: 'Email verification failed',
        error: error,
        suggestion: 'Request a new email verification link.',
      });
      return;
    }
    console.error('Error verifying email:', error);
    //res.status(500).json({ message: 'Email verification failed', error });
    res.redirect(`${config.baseFrontendUrl}/email-verified-failure`);
  }
};
/*
export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        // Decode the expired token to extract user info
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.userId) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findOne({_id:decoded.userId});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a new token
        const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Send the new verification email
        await sendVerificationEmail(user.email, newToken);

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Error resending verification email', error });
    }
};
*/

//User profile data
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile.", error });
  }
};


//Set up Multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, './../uploads/avatars'); // Resolve relative to the current file
    console.log('Resolved Upload Directory:', uploadPath);

    //Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // Pass the resolved path to Multer
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isAllowed = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed.'));
    }
  },
});

//Profile update
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log('Request body:', req.body); // Logs the body of the request
  console.log('Uploaded file:', req.file); // Logs the file information if uploaded
  try {
    const userId = req.user?.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Avatar file is missing.' });
      return;
    }

    const updates = { ...req.body };

    // Handle password change
    if (updates.currentPassword && updates.newPassword) {
      const isMatch = await argon2.verify(user.password, updates.currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: "Incorrect current password." });
        return;
      }

      updates.password = await argon2.hash(updates.newPassword);
      delete updates.currentPassword;
      delete updates.newPassword;
    }

    //Handle avatar upload
    if (req.file) {
      updates.avatar = `/uploads/avatars/${req.file.filename}`;

      //Optionally delete the old avatar if it exists
      if (user.avatar) {
        try {
          fs.unlink(path.resolve(user.avatar), (err) => {
            console.log("Old avatar deleted successfully.");
          });
        } catch (error) {
          console.warn("Failed to delete old avatar:", error);
        }
      } else {
        console.log("No old avatar to delete.");
      }
    }

    //Prevent certain fields from being updated
    delete updates.email;
    delete updates.role;

    //Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -refreshToken');
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.', error });
  }
};

