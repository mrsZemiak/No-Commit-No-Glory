import express from 'express';
import Database from '../config/db';

const router = express.Router();

router.get('/users', async (req, res) => {
    const db = Database.getInstance();
    const User = db.getConnection().model('User'); // Example with Mongoose model
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

export default router;