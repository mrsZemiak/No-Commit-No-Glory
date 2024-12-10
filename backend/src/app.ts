import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from "./routes/profile.routes";

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', routes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Database connection (optional for app testing)
const mongoUri: string = process.env.MONGO_URI || '';
if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}

mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Export the app for testing or server use
export default app;