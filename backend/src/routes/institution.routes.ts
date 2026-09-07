import { Router } from 'express';
import { institutionController } from '../controllers/institution.controller';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';
import { studentAffiliationController } from '../controllers/student-affiliation.controller';

const router = Router();

// Student institution discovery routes
router.get('/available', authenticate, authorizeRoles(UserRole.STUDENT), studentAffiliationController.getAvailableInstitutions);
router.get('/:institutionId/departments', authenticate, authorizeRoles(UserRole.STUDENT), studentAffiliationController.getInstitutionDepartments);
router.get('/:institutionId/departments/:departmentId/programs', authenticate, institutionController.getDepartmentPrograms);
router.get('/:institutionId/programs/:programId/batches', authenticate, institutionController.getProgramBatches);

// ----------------------------------------------------
// Dashboard & Analytics Routes (Phase 15)
// ----------------------------------------------------
router.get('/dashboard', authenticate, authorizeRoles(UserRole.INSTITUTION), analyticsController.getInstitutionDashboard);
router.get('/analytics/skills', authenticate, authorizeRoles(UserRole.INSTITUTION), analyticsController.getInstitutionSkillAnalytics);
router.get('/analytics/placements', authenticate, authorizeRoles(UserRole.INSTITUTION), analyticsController.getPlacementAnalytics);

// ----------------------------------------------------
// Profile Routes
// ----------------------------------------------------
router.get('/profile', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getMyProfile);
router.post('/profile', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createMyProfile);
router.patch('/profile', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updateMyProfile);

// ----------------------------------------------------
// Department Routes
// ----------------------------------------------------
router.get('/departments', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getDepartments);
router.post('/departments', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createDepartment);
router.get('/departments/:departmentId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getDepartmentById);
router.patch('/departments/:departmentId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updateDepartment);
router.delete('/departments/:departmentId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.deleteDepartment);

// ----------------------------------------------------
// Academic Program Routes (Phase B)
// ----------------------------------------------------
router.get('/programs', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getPrograms);
router.post('/programs', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createProgram);
router.get('/programs/:programId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getProgramById);
router.patch('/programs/:programId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updateProgram);
router.delete('/programs/:programId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.deleteProgram);

// ----------------------------------------------------
// Academic Batch Routes (Phase C)
// ----------------------------------------------------
router.get('/batches', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getBatches);
router.post('/batches', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createBatch);
router.get('/batches/:batchId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getBatchById);
router.patch('/batches/:batchId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updateBatch);
router.delete('/batches/:batchId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.deleteBatch);

// ----------------------------------------------------
// Student Academic Enrollment Routes (Phase C)
// ----------------------------------------------------
router.get('/enrollments', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getEnrollments);
router.post('/enrollments', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createEnrollment);
router.get('/enrollments/:enrollmentId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getEnrollmentById);
router.patch('/enrollments/:enrollmentId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updateEnrollment);
router.delete('/enrollments/:enrollmentId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.deleteEnrollment);

// Student affiliation review routes
router.get('/student-affiliations', authenticate, authorizeRoles(UserRole.INSTITUTION), studentAffiliationController.getInstitutionRequests);
router.get('/student-affiliations/:affiliationId', authenticate, authorizeRoles(UserRole.INSTITUTION), studentAffiliationController.getInstitutionRequest);
router.post('/student-affiliations/:affiliationId/verify', authenticate, authorizeRoles(UserRole.INSTITUTION), studentAffiliationController.verify);
router.post('/student-affiliations/:affiliationId/reject', authenticate, authorizeRoles(UserRole.INSTITUTION), studentAffiliationController.reject);

// ----------------------------------------------------
// Placement Routes
// ----------------------------------------------------
router.get('/placements', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getPlacements);
router.post('/placements', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createPlacement);
router.get('/placements/:placementId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getPlacementById);
router.patch('/placements/:placementId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updatePlacement);
router.delete('/placements/:placementId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.deletePlacement);

// ----------------------------------------------------
// Placement Record Routes
// ----------------------------------------------------
router.get('/placements/:placementId/records', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getPlacementRecords);
router.post('/placements/:placementId/records', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.createPlacementRecord);
router.get('/placement-records/:recordId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.getPlacementRecordById);
router.patch('/placement-records/:recordId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.updatePlacementRecord);
router.delete('/placement-records/:recordId', authenticate, authorizeRoles(UserRole.INSTITUTION), institutionController.deletePlacementRecord);

// ----------------------------------------------------
// Public / Authenticated Discovery
// Placed after static routes so /dashboard, /profile, /departments match first
// ----------------------------------------------------
router.get('/:institutionId', authenticate, institutionController.getInstitutionById);

export default router;
