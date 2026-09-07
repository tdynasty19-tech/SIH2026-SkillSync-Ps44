import { Router } from 'express';
import { matchingController } from '../controllers/matching.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All matching endpoints require authentication
router.use(authenticate);

/**
 * @openapi
 * /matching/opportunities/{opportunityId}:
 *   get:
 *     summary: Retrieve deterministic match score and breakdown for an opportunity
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the opportunity
 *       - in: query
 *         name: opportunityType
 *         schema:
 *           type: string
 *           default: JOB
 *         description: Polymorphic opportunity type (JOB, INTERNSHIP, PROJECT, etc.)
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Student ID (required for Industry users to inspect candidate match)
 *     responses:
 *       200:
 *         description: Match calculated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (IDOR or unauthorized access)
 *       404:
 *         description: Opportunity or Student profile not found
 */
router.get('/opportunities/:opportunityId', matchingController.getOpportunityMatch);

/**
 * @openapi
 * /matching/students/{studentId}:
 *   get:
 *     summary: Retrieve deterministic match score for a specific student and opportunity
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student profile
 *       - in: query
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the opportunity
 *       - in: query
 *         name: opportunityType
 *         schema:
 *           type: string
 *           default: JOB
 *         description: Opportunity type
 *     responses:
 *       200:
 *         description: Match calculated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (IDOR protection prevents viewing other students)
 *       404:
 *         description: Opportunity or Student profile not found
 */
router.get('/students/:studentId', matchingController.getStudentMatch);

export default router;
