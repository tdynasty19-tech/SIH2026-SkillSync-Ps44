import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getFDPs);
router.get('/:fdpId', opportunityController.getFDPById);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY),
  opportunityController.createFDP
);
router.patch(
  '/:fdpId',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY),
  opportunityController.updateFDP
);
router.delete(
  '/:fdpId',
  authenticate,
  authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY),
  opportunityController.deleteFDP
);

export default router;
