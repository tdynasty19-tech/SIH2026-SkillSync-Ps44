import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Application Analytics (Phase 15)
router.get('/analytics', authenticate, analyticsController.getApplicationAnalytics);

/**
 * @openapi
 * /applications:
 *   post:
 *     summary: Submit an application to an opportunity (Student only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [opportunityId, opportunityType]
 *             properties:
 *               opportunityId:
 *                 type: integer
 *                 example: 1
 *               opportunityType:
 *                 type: string
 *                 enum: [JOB, INTERNSHIP, PROJECT, LEARNING_PROGRAM, FACULTY_OPPORTUNITY, FDP, RESEARCH_OPPORTUNITY, CONSULTANCY_OPPORTUNITY]
 *                 example: JOB
 *               coverLetter:
 *                 type: string
 *                 example: I am eager to apply for this role.
 *               resumeUrl:
 *                 type: string
 *                 example: https://cdn.example.com/resumes/my_resume.pdf
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Opportunity or Student profile not found
 *       409:
 *         description: Duplicate application, closed opportunity, or deadline passed
 */
router.post('/', authenticate, authorizeRoles(UserRole.STUDENT), applicationController.submitApplication);

/**
 * @openapi
 * /applications/me:
 *   get:
 *     summary: View applications submitted by authenticated student
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED]
 *       - in: query
 *         name: opportunityType
 *         schema:
 *           type: string
 *           enum: [JOB, INTERNSHIP, PROJECT, LEARNING_PROGRAM, FACULTY_OPPORTUNITY, FDP, RESEARCH_OPPORTUNITY, CONSULTANCY_OPPORTUNITY]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of student applications with pagination
 */
router.get('/me', authenticate, authorizeRoles(UserRole.STUDENT), applicationController.getMyApplications);

/**
 * @openapi
 * /applications/me/{applicationId}:
 *   get:
 *     summary: View single application details for authenticated student (IDOR protected)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application details with status history
 *       404:
 *         description: Application not found
 */
router.get(
  '/me/:applicationId',
  authenticate,
  authorizeRoles(UserRole.STUDENT),
  applicationController.getMyApplicationById
);

/**
 * @openapi
 * /applications/opportunity/{opportunityType}/{opportunityId}:
 *   get:
 *     summary: View applications for an opportunity (Opportunity owner only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [JOB, INTERNSHIP, PROJECT, LEARNING_PROGRAM, FACULTY_OPPORTUNITY, FDP, RESEARCH_OPPORTUNITY, CONSULTANCY_OPPORTUNITY]
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated applications for opportunity
 *       403:
 *         description: Forbidden - caller does not own this opportunity
 */
router.get(
  '/opportunity/:opportunityType/:opportunityId',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION),
  applicationController.getOpportunityApplications
);

/**
 * @openapi
 * /applications/review/{applicationId}:
 *   get:
 *     summary: View application review details (Opportunity owner only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application review details with student profile
 *       403:
 *         description: Forbidden - caller does not own this opportunity
 *       404:
 *         description: Application not found
 */
router.get(
  '/review/:applicationId',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION),
  applicationController.getOpportunityApplicationById
);

/**
 * @openapi
 * /applications/{applicationId}/status:
 *   patch:
 *     summary: Update application status (Opportunity owner only, strictly follows transition state machine)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED]
 *                 example: UNDER_REVIEW
 *               reason:
 *                 type: string
 *                 example: Moving to technical screening stage
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Forbidden - caller does not own this opportunity or is student
 *       409:
 *         description: Conflict - invalid status transition
 */
router.patch(
  '/:applicationId/status',
  authenticate,
  authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION),
  applicationController.updateApplicationStatus
);

export default router;
