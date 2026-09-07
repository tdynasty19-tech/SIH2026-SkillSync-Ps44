import { Router } from 'express';
import { skillController } from '../controllers/skill.controller';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/analytics/demand', analyticsController.getSkillDemandAnalytics);
router.get('/', skillController.getSkills);
router.get('/:skillId', skillController.getSkillById);

export default router;
