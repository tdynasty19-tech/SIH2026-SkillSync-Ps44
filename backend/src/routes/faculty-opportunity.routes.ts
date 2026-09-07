import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getFacultyOpportunities);
router.get('/:opportunityId', opportunityController.getFacultyOpportunityById);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY, UserRole.ACADEMICIAN),
  opportunityController.createFacultyOpportunity
);
router.patch(
  '/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY, UserRole.ACADEMICIAN),
  opportunityController.updateFacultyOpportunity
);
router.delete(
  '/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY, UserRole.ACADEMICIAN),
  opportunityController.deleteFacultyOpportunity
);

export default router;
