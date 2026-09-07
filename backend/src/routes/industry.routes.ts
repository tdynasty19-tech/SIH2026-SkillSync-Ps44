import { Router } from 'express';
import { industryController } from '../controllers/industry.controller';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// Enforce authentication and Industry role across all industry routes
router.use(authenticate);
router.use(authorizeRoles(UserRole.INDUSTRY));

// ----------------------------------------------------
// Dashboard & Analytics Routes (Phase 15)
// ----------------------------------------------------
router.get('/dashboard', analyticsController.getIndustryDashboard);
router.get('/analytics/hiring', analyticsController.getIndustryHiringAnalytics);
router.get('/analytics/applications', analyticsController.getIndustryApplicationAnalytics);

/**
 * @openapi
 * /industry/profile:
 *   get:
 *     summary: Get authenticated industry profile
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Industry profile fetched successfully
 *       404:
 *         description: Industry profile not found
 */
router.get('/profile', industryController.getMyProfile);

/**
 * @openapi
 * /industry/profile:
 *   post:
 *     summary: Create industry profile for authenticated user
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName, industryType]
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Acme Corporation
 *               cin:
 *                 type: string
 *                 example: L17110MH1973PLC019786
 *               industryType:
 *                 type: string
 *                 example: Information Technology
 *               websiteUrl:
 *                 type: string
 *                 example: https://acme.example.com
 *               location:
 *                 type: string
 *                 example: Electronic City, Bangalore
 *               city:
 *                 type: string
 *                 example: Bangalore
 *               state:
 *                 type: string
 *                 example: Karnataka
 *               country:
 *                 type: string
 *                 example: India
 *               description:
 *                 type: string
 *                 example: Leading global provider of technology services.
 *     responses:
 *       201:
 *         description: Industry profile created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Industry profile already exists for this account
 */
router.post('/profile', industryController.createMyProfile);

/**
 * @openapi
 * /industry/profile:
 *   patch:
 *     summary: Update industry profile for authenticated user
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               cin:
 *                 type: string
 *               industryType:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               location:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Industry profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Industry profile not found
 */
router.patch('/profile', industryController.updateMyProfile);

/**
 * @openapi
 * /industry/contacts:
 *   get:
 *     summary: List industry contacts with pagination and search
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Industry contacts fetched successfully
 */
router.get('/contacts', industryController.getContacts);

/**
 * @openapi
 * /industry/contacts:
 *   post:
 *     summary: Add an industry contact
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Priya Sharma
 *               designation:
 *                 type: string
 *                 example: Head of Talent Acquisition
 *               email:
 *                 type: string
 *                 example: priya.sharma@acme.example.com
 *               phone:
 *                 type: string
 *                 example: +919876543210
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Industry contact created successfully
 *       400:
 *         description: Validation error
 */
router.post('/contacts', industryController.createContact);

/**
 * @openapi
 * /industry/contacts/{contactId}:
 *   get:
 *     summary: Get single industry contact (IDOR protected)
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contact details fetched successfully
 *       404:
 *         description: Contact not found
 */
router.get('/contacts/:contactId', industryController.getContactById);

/**
 * @openapi
 * /industry/contacts/{contactId}:
 *   patch:
 *     summary: Update an industry contact (IDOR protected)
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
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
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contact not found
 */
router.patch('/contacts/:contactId', industryController.updateContact);

/**
 * @openapi
 * /industry/contacts/{contactId}:
 *   delete:
 *     summary: Delete an industry contact (IDOR protected)
 *     tags: [Industry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 */
router.delete('/contacts/:contactId', industryController.deleteContact);

export default router;
