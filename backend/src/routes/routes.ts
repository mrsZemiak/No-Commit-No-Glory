import { Router } from 'express';
import questionRoutes from "./question.routes";
import categoriesRoutes from "./categories.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use(questionRoutes);
router.use(categoriesRoutes);
router.use(userRoutes);


router.get('/', (req, res) => {
    res.send('Hello from routes');
});

export default router;
