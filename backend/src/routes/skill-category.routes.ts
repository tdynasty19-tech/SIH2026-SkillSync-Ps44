import { Router } from 'express';
import { skillController } from '../controllers/skill.controller';

const router = Router();

router.get('/', skillController.getCategories);
router.get('/:categoryId', skillController.getCategoryById);

export default router;
