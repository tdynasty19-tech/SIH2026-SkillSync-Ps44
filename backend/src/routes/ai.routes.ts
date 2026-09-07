import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rate-limiter.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// All AI endpoints require authentication and rate limiting
router.use(authenticate);
router.use(aiRateLimiter);

/**
 * @openapi
 * /ai/analyze-resume:
 *   post:
 *     summary: Analyze resume content advisory
 *     description: Sanitizes input text, extracts skills, strengths, skill gaps, and career readiness. Advisory only.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resumeText:
 *                 type: string
 *                 description: Raw resume text to sanitize and analyze
 *               documentId:
 *                 type: integer
 *                 description: ID of an owned or shared private resume document
 *     responses:
 *       200:
 *         description: Resume analyzed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (IDOR or unauthorized document access)
 */
router.post(
  '/analyze-resume',
  authorizeRoles(UserRole.STUDENT, UserRole.INDUSTRY, UserRole.INSTITUTION, UserRole.ACADEMICIAN),
  aiController.analyzeResume
);

/**
 * @openapi
 * /ai/analyze-opportunity:
 *   post:
 *     summary: Analyze opportunity requirements advisory
 *     description: Analyzes technical requirements and responsibilities of an opportunity without altering business logic.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opportunityId
 *             properties:
 *               opportunityId:
 *                 type: integer
 *               opportunityType:
 *                 type: string
 *                 enum: [JOB, INTERNSHIP, PROJECT, RESEARCH, FACULTY, FDP]
 *                 default: JOB
 *               customDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Opportunity analyzed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Opportunity not found
 */
router.post(
  '/analyze-opportunity',
  authorizeRoles(UserRole.STUDENT, UserRole.INDUSTRY, UserRole.INSTITUTION, UserRole.ACADEMICIAN),
  aiController.analyzeOpportunity
);

/**
 * @openapi
 * /ai/skill-gap/{studentId}:
 *   get:
 *     summary: Get AI-enriched skill gap explanations and advice
 *     description: Combines deterministic skill gaps with advisory AI explanations and learning suggestions.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID (subject to ownership/institutional RBAC)
 *     responses:
 *       200:
 *         description: Skill gap assistance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Cross-student IDOR guard)
 *       404:
 *         description: Student profile not found
 */
/**
 * @openapi
 * /ai/skill-gap:
 *   get:
 *     summary: Get AI-enriched skill gap explanations for authenticated student
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill gap assistance retrieved successfully
 */
router.get(
  '/skill-gap',
  authorizeRoles(UserRole.STUDENT),
  aiController.getSkillGapAssistance
);

router.get(
  '/skill-gap/:studentId',
  authorizeRoles(UserRole.STUDENT, UserRole.INSTITUTION),
  aiController.getSkillGapAssistance
);

/**
 * @openapi
 * /ai/career-copilot:
 *   post:
 *     summary: Advisory Career Copilot interaction
 *     description: Interactive student copilot with data minimization and deterministic recommendation fallback.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 2000
 *               targetRoleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Copilot responded successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Student profile not found
 */
router.post(
  '/career-copilot',
  authorizeRoles(UserRole.STUDENT),
  aiController.getCareerCopilot
);

/**
 * @openapi
 * /ai/learning-roadmap:
 *   get:
 *     summary: Retrieve structured learning roadmap for authenticated student
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Generate structured learning roadmap
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/learning-roadmap',
  authorizeRoles(UserRole.STUDENT),
  aiController.generateLearningRoadmap
);

router.post(
  '/learning-roadmap',
  authorizeRoles(UserRole.STUDENT),
  aiController.generateLearningRoadmap
);

/**
 * @openapi
 * /ai/opportunities/{opportunityId}/explanation:
 *   get:
 *     summary: Get AI explanation for deterministic opportunity match score
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: opportunityType
 *         schema:
 *           type: string
 *           default: JOB
 *     responses:
 *       200:
 *         description: Opportunity explanation retrieved successfully
 */
router.get(
  '/opportunities/:opportunityId/explanation',
  authorizeRoles(UserRole.STUDENT, UserRole.INDUSTRY),
  aiController.explainOpportunityMatch
);

export default router;
