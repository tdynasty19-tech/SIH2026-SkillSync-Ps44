import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// All recommendation endpoints require authentication
router.use(authenticate);

/**
 * @openapi
 * /recommendations/opportunities:
 *   get:
 *     summary: Retrieve deterministic opportunity recommendations for authenticated student
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Optional opportunity type filter (JOB, INTERNSHIP, PROJECT, etc.)
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *         description: Minimum match score threshold (0-100)
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
 *         description: Opportunity recommendations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Students only)
 */
router.get(
  '/opportunities',
  authorizeRoles(UserRole.STUDENT),
  recommendationController.getOpportunityRecommendations
);

/**
 * @openapi
 * /recommendations/careers:
 *   get:
 *     summary: Retrieve deterministic career recommendations for authenticated student
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: ACTIVE
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
 *         description: Career recommendations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Students only)
 */
router.get(
  '/careers',
  authorizeRoles(UserRole.STUDENT),
  recommendationController.getCareerRecommendations
);

/**
 * @openapi
 * /recommendations/learning:
 *   get:
 *     summary: Retrieve skill-gap-driven learning program recommendations for authenticated student
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Learning recommendations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Students only)
 */
router.get(
  '/learning',
  authorizeRoles(UserRole.STUDENT),
  recommendationController.getLearningRecommendations
);

/**
 * @openapi
 * /recommendations/mentors:
 *   get:
 *     summary: Retrieve deterministic mentor recommendations for authenticated student
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Mentor recommendations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Students only)
 */
router.get(
  '/mentors',
  authorizeRoles(UserRole.STUDENT),
  recommendationController.getMentorRecommendations
);

/**
 * @openapi
 * /recommendations/candidates:
 *   get:
 *     summary: Retrieve deterministic candidate recommendations for an owned industry opportunity
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the owned opportunity
 *       - in: query
 *         name: opportunityType
 *         schema:
 *           type: string
 *           default: JOB
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
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
 *         description: Candidates retrieved and ranked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Opportunity not owned by caller)
 *       404:
 *         description: Opportunity not found
 */
router.get(
  '/candidates',
  authorizeRoles(UserRole.INDUSTRY),
  recommendationController.getCandidateRecommendations
);

export default router;
