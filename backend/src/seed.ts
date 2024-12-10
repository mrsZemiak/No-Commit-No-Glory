import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './models/Role';
import Category from './models/Category';
import User from './models/User';
import Conference from './models/Conference';
import Paper from './models/Paper';
import Review from './models/Review';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scisubmit';

// Async function for DB connection, seeding and collection creation
const prepareDatabase = async () => {
    try {
        // Connect to the MongoDB database
        await mongoose.connect(MONGO_URI);

        console.log('Connected to MongoDB.');

        // Clear the roles collection
        await Role.deleteMany({});
        console.log('Cleared the roles collection.');

        // Insert roles
        await Role.insertMany([
            {
                name: 'admin',
                permissions: ['manage_conferences', 'assign_reviewers', 'view_papers', 'view_reports', 'manage_profile'],
                ui_components: ['/admin_dashboard', '/manage_users', '/manage_conferences', '/reports', '/profile'],
            },
            {
                name: 'participant',
                permissions: ['view_submitted_papers', 'submit_papers', 'view_reviews', 'manage_profile'],
                ui_components: ['/student_dashboard', '/upload_paper','/request_extension', '/profile'],
            },
            {
                name: 'reviewer',
                permissions: ['view_assigned_papers', 'submit_reviews', 'download_papers', 'manage_profile'],
                ui_components: ['/reviewer_dashboard', '/review_paper', '/profile'],
            },
        ]);

        console.log('Roles inserted successfully.');

        // Initialize empty collections without data and ensure they exist
        await Category.createCollection();
        await User.createCollection();
        await Conference.createCollection();
        await Paper.createCollection();
        await Review.createCollection();

        console.log('Database preparation complete.');

        // Exit the script successfully
        process.exit(0);
    } catch (error) {
        console.error('Error preparing the database', error);
        process.exit(1);
    }
};

// IIFE to handle the async prepareDatabase function
(async () => {
    try {
        await prepareDatabase();
        console.log("Database prepared successfully.");
    } catch (error) {
        console.error("Error in preparing the database:", error);
    }
})();