import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { searchRateLimiter } from '../middlewares/rate-limiter.middleware';

const router = Router();

// Search endpoint requires authenticated platform access and rate limiting
router.use(authenticate);
router.use(searchRateLimiter);

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Platform-wide global search
 *     description: Unified search across jobs, internships, projects, learning programs, mentors, skills, career roles, companies, and institutions.
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (title, description, location, or expertise)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [jobs, internships, projects, learningPrograms, mentors, skills, careerRoles, companies, institutions]
 *         description: Optional category filter. If omitted, searches across all categories.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Search completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                       example: developer
 *                     type:
 *                       type: string
 *                       example: all
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           location:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Validation error (invalid query parameter, unsupported type, negative page/limit)
 *       401:
 *         description: Unauthorized (missing or invalid Bearer token)
 */
router.get('/', searchController.search);

export default router;
