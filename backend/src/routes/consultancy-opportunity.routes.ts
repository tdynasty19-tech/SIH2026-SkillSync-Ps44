import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getConsultancyOpportunities);
router.get('/:opportunityId', opportunityController.getConsultancyOpportunityById);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY),
  opportunityController.createConsultancyOpportunity
);
router.patch(
  '/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY),
  opportunityController.updateConsultancyOpportunity
);
router.delete(
  '/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY),
  opportunityController.deleteConsultancyOpportunity
);

export default router;
