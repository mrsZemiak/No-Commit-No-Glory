import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Database from "./config/db";
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import reviewerRoutes from "./routes/reviewer.routes";
import participantRoutes from "./routes/participant.routes";
import adminRoutes from "./routes/admin.routes";
import questionRoutes from "./routes/question.routes";

dotenv.config(); // Load environment variables from .env

const app = express();

//Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: '*', // Allowed headers
  credentials: true, // Allow credentials like cookies
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

//Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/',questionRoutes);

// Default root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

export default app;