import { Router, Request, Response } from 'express';
import Category from '../models/Category';

const router = Router();


router.get('/categories', async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/categories', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Error adding category:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/* treba toto pozrieť

router.put('/categories/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(updatedCategory);

    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Internal Server Error' });

    }
});

router.delete('/categories/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});*/

export default router;
