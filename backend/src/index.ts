import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/routes';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);  // All API routes under '/api'

// Simple route for testing
app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

// Ensuring MONGO_URI is defined - error throwing
const mongoUri: string = process.env.MONGO_URI || '';
if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}

// Connection to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error: ', err))

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});