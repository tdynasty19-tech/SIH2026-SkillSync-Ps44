import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Public catalogue browsing
router.get('/', assessmentController.getAssessments);
router.get('/:assessmentId', assessmentController.getAssessmentById);

// Protected student attempt actions
router.post(
  '/:assessmentId/attempts',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  assessmentController.startAttempt
);

router.get(
  '/attempts/:attemptId',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  assessmentController.getAttempt
);

router.post(
  '/attempts/:attemptId/submit',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  assessmentController.submitAttempt
);

export default router;
