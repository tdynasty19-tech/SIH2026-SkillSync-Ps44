import { Router } from 'express';
import { careerController } from '../controllers/career.controller';
import { recommendationController } from '../controllers/recommendation.controller';
import { aiController } from '../controllers/ai.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Student Career Intelligence Endpoints
router.get(
  '/recommendations',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  recommendationController.getCareerRecommendations
);

router.get(
  '/roadmap',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  aiController.generateLearningRoadmap
);

router.get(
  '/skill-gap-explanation',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  aiController.getSkillGapAssistance
);

// General Career Role Catalog
router.get('/', careerController.getCareerRoles);
router.get('/:careerRoleId', careerController.getCareerRoleById);

export default router;

