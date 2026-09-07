import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getLearningPrograms);
router.get('/:programId', opportunityController.getLearningProgramById);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION),
  opportunityController.createLearningProgram
);
router.patch(
  '/:programId',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION),
  opportunityController.updateLearningProgram
);
router.delete(
  '/:programId',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION),
  opportunityController.deleteLearningProgram
);

export default router;
