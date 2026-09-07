import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getResearchOpportunities);
router.get('/:opportunityId', opportunityController.getResearchOpportunityById);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY),
  opportunityController.createResearchOpportunity
);
router.patch(
  '/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY),
  opportunityController.updateResearchOpportunity
);
router.delete(
  '/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY),
  opportunityController.deleteResearchOpportunity
);

export default router;
