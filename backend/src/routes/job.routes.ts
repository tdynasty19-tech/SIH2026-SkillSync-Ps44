import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getJobs);
router.get('/:jobId', opportunityController.getJobById);
router.post('/', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.createJob);
router.patch('/:jobId', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.updateJob);
router.delete('/:jobId', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.deleteJob);

export default router;
