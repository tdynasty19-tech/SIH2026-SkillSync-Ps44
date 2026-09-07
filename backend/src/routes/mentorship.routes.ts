import { Router } from 'express';
import { mentorshipController } from '../controllers/mentorship.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Protect all mentorship routes
router.use(authenticate);

// ----------------------------------------------------
// 1. Mentors
// ----------------------------------------------------
router.get('/mentors', mentorshipController.getMentors);
router.get('/mentors/me', mentorshipController.getMyMentorProfile);
router.post('/mentors/me', mentorshipController.createMentorProfile);
router.patch('/mentors/me', mentorshipController.updateMentorProfile);
router.get('/mentors/:mentorId', mentorshipController.getMentorById);

// ----------------------------------------------------
// 2. Mentorship Requests
// ----------------------------------------------------
router.post('/requests', authorizeRoles(UserRole.STUDENT), mentorshipController.createRequest);
router.get('/requests', mentorshipController.getMyRequests);
router.get('/requests/:requestId', mentorshipController.getRequestById);
router.patch('/requests/:requestId/respond', mentorshipController.respondToRequest);

// ----------------------------------------------------
// 3. Mentorship Sessions
// ----------------------------------------------------
router.post('/sessions', mentorshipController.createSession);
router.get('/sessions/:sessionId', mentorshipController.getSessionById);
router.get('/sessions/request/:requestId', mentorshipController.getSessions);
router.patch('/sessions/:sessionId', mentorshipController.updateSession);

export default router;
