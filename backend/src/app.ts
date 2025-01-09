import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Database from "./config/db";
import commonRoutes from './routes/common.routes';
import authRoutes from './routes/auth.routes';
import reviewerRoutes from "./routes/reviewer.routes";
import participantRoutes from "./routes/participant.routes";
import adminRoutes from './routes/admin.routes'

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: '*',
  credentials: true,
};
app.use('/api', cors(corsOptions));

// Initialize database
const initializeDatabase = async () => {
  try {
    const db = Database.getInstance();
    await db.connect();
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

initializeDatabase().catch((error) => {
  console.error('Database initialization error:', error);
  process.exit(1);
});

// API Routes
app.use('/api', commonRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/reviewer', reviewerRoutes);

export default app;