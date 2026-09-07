import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getInternships);
router.get('/:internshipId', opportunityController.getInternshipById);
router.post('/', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.createInternship);
router.patch('/:internshipId', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.updateInternship);
router.delete('/:internshipId', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.deleteInternship);

export default router;
