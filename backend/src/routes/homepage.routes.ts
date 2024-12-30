import express from 'express';
import { getHomepageData } from '../controllers/homepage.controller';

const router = express.Router();

// Public route for homepage
router.get('/home', getHomepageData);

export default router;