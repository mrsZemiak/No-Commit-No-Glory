import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Database from "./config/db";
import commonRoutes from './routes/common.routes';
import authRoutes from './routes/auth.routes';
import reviewerRoutes from "./routes/reviewer.routes";
import participantRoutes from "./routes/participant.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config(); // Load environment variables from .env

const app = express();

//Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5174','http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: '*',
  credentials: true,
};

app.use(cors(corsOptions)); // Add CORS middleware

// Initialize database
const initializeDatabase = async () => {
  try {
    const db = Database.getInstance();
    await db.connect(); // Wait for the database to connect
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Exit the process if the database connection fails
  }
};

initializeDatabase().catch((error) => {
  console.error('Database initialization error:', error);
  process.exit(1);
});

// Routes
app.use('/', commonRoutes);
app.use('/auth', authRoutes);

// Role-specific routes
app.use('/admin', adminRoutes);
app.use('/participant', participantRoutes);
app.use('/reviewer', reviewerRoutes);

// Default root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

export default app;