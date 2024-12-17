import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import Database from "./config/db";
import reviewerRoutes from "./routes/reviewer.routes";
import participantRoutes from "./routes/participant.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config(); //Load environment variables from .env

const app = express();

Database.getInstance(); //Initialize database

//Middleware
app.use(express.json());

//Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/reviewers', reviewerRoutes);

//Export the app for testing or server use
export default app;