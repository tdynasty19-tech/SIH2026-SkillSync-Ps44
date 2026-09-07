import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.get('/', opportunityController.getProjects);
router.get('/:projectId', opportunityController.getProjectById);
router.post('/', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.createProject);
router.patch('/:projectId', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.updateProject);
router.delete('/:projectId', authenticate, authorizeRoles(UserRole.INDUSTRY), opportunityController.deleteProject);

export default router;
