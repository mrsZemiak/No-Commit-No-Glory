import { Router } from 'express';
import userRoutes from './user.routes'

const router = Router();

// Define your routes
router.get('/', (req, res) => {
    res.send('Hello from routes');
});
router.use('/users', userRoutes);

export default router;