import { Router } from 'express';
import { academicianController } from '../controllers/academician.controller';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Enforce authentication and Academician role across all academician routes
router.use(authenticate);
router.use(authorizeRoles(UserRole.ACADEMICIAN));

// Dashboard route
router.get('/dashboard', analyticsController.getAcademicianDashboard);

/**
 * @openapi
 * /academician/profile:
 *   get:
 *     summary: Get authenticated academician profile
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academician profile fetched successfully
 *       404:
 *         description: Academician profile not found
 */
router.get('/profile', academicianController.getMyProfile);

/**
 * @openapi
 * /academician/profile:
 *   post:
 *     summary: Create academician profile for authenticated user
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department, designation]
 *             properties:
 *               department:
 *                 type: string
 *                 example: Computer Science & Engineering
 *               designation:
 *                 type: string
 *                 example: Associate Professor
 *               qualification:
 *                 type: string
 *                 example: Ph.D. in Distributed Systems
 *               specialization:
 *                 type: string
 *                 example: Cloud Computing & Fault Tolerant Protocols
 *               experienceYears:
 *                 type: number
 *                 example: 8.5
 *               bio:
 *                 type: string
 *                 example: Dedicated researcher and educator in distributed computing.
 *               researchInterests:
 *                 type: string
 *                 example: Consensus algorithms, Byzantine fault tolerance, Cloud scalability.
 *               publications:
 *                 type: string
 *                 example: IEEE Trans. Parallel Distrib. Syst. 2024, ACM TOCS 2023.
 *               linkedinUrl:
 *                 type: string
 *                 example: https://linkedin.com/in/prof-dr-sharma
 *               googleScholarUrl:
 *                 type: string
 *                 example: https://scholar.google.com/citations?user=xyz123
 *               institutionId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Academician profile created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Academician profile already exists for this account
 */
router.post('/profile', academicianController.createMyProfile);

/**
 * @openapi
 * /academician/profile:
 *   patch:
 *     summary: Update academician profile for authenticated user
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               qualification:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experienceYears:
 *                 type: number
 *               bio:
 *                 type: string
 *               researchInterests:
 *                 type: string
 *               publications:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *               googleScholarUrl:
 *                 type: string
 *               institutionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Academician profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Academician profile not found
 */
router.patch('/profile', academicianController.updateMyProfile);

/**
 * @openapi
 * /academician/associations:
 *   get:
 *     summary: List academic institution associations for authenticated academician
 *     tags: [Academician]
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
 *         description: Academic institution associations fetched successfully
 */
router.get('/associations', academicianController.getAssociations);

/**
 * @openapi
 * /academician/associations:
 *   post:
 *     summary: Create academic institution association
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [institutionId, designation, department, startDate]
 *             properties:
 *               institutionId:
 *                 type: integer
 *                 example: 1
 *               designation:
 *                 type: string
 *                 example: Visiting Professor
 *               department:
 *                 type: string
 *                 example: School of AI & Computing
 *               startDate:
 *                 type: string
 *                 example: 2024-01-15
 *               endDate:
 *                 type: string
 *                 example: 2025-06-30
 *               isCurrent:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Academic institution association created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Institution not found
 */
router.post('/associations', academicianController.createAssociation);

/**
 * @openapi
 * /academician/associations/{associationId}:
 *   get:
 *     summary: Get single academic institution association (IDOR protected)
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: associationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Association fetched successfully
 *       404:
 *         description: Association not found
 */
router.get('/associations/:associationId', academicianController.getAssociationById);

/**
 * @openapi
 * /academician/associations/{associationId}:
 *   patch:
 *     summary: Update academic institution association (IDOR protected)
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: associationId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               institutionId:
 *                 type: integer
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               isCurrent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Association updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Association not found
 */
router.patch('/associations/:associationId', academicianController.updateAssociation);

/**
 * @openapi
 * /academician/associations/{associationId}:
 *   delete:
 *     summary: Delete academic institution association (IDOR protected)
 *     tags: [Academician]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: associationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Association deleted successfully
 *       404:
 *         description: Association not found
 */
router.delete('/associations/:associationId', academicianController.deleteAssociation);

export default router;
