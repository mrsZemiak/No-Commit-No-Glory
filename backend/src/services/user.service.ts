import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import User from '../models/User';
import UserSchema from "../models/User";



export const findByEmail = async (email: string) => {
    return User.findOne({ email });
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

export const generateToken = (user: any) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        config.jwtSecret!,
        { expiresIn: '1h' }
    );
};

export const getUserById = async (userId: string) => {
    return User.findById(userId);
};

export const updateUser = async (userId: string, updates: Partial<typeof UserSchema>) => {
    return User.findByIdAndUpdate(userId, updates, { new: true });
};