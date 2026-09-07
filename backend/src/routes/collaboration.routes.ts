import { Router } from 'express';
import { collaborationController } from '../controllers/collaboration.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Protect all collaboration routes with authentication and RBAC (Institution & Industry)
router.use(authenticate);
router.use(authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY));

// Core Collaborations
router.get('/', collaborationController.getCollaborations);
router.post('/', collaborationController.createCollaboration);
router.get('/:collaborationId', collaborationController.getCollaborationById);
router.patch('/:collaborationId', collaborationController.updateCollaboration);
router.delete('/:collaborationId', collaborationController.deleteCollaboration);

// Workshops
router.post('/:collaborationId/workshops', collaborationController.createWorkshop);
router.patch('/workshops/:workshopId', collaborationController.updateWorkshop);
router.delete('/workshops/:workshopId', collaborationController.deleteWorkshop);

// Guest Lectures
router.post('/:collaborationId/guest-lectures', collaborationController.createGuestLecture);
router.patch('/guest-lectures/:lectureId', collaborationController.updateGuestLecture);
router.delete('/guest-lectures/:lectureId', collaborationController.deleteGuestLecture);

// Industrial Trainings
router.post('/:collaborationId/industrial-trainings', collaborationController.createIndustrialTraining);
router.patch('/industrial-trainings/:trainingId', collaborationController.updateIndustrialTraining);
router.delete('/industrial-trainings/:trainingId', collaborationController.deleteIndustrialTraining);

// Live Projects
router.post('/:collaborationId/live-projects', collaborationController.createLiveProject);
router.patch('/live-projects/:projectId', collaborationController.updateLiveProject);
router.delete('/live-projects/:projectId', collaborationController.deleteLiveProject);

export default router;
