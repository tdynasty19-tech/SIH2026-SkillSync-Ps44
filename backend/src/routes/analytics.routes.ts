import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

// ----------------------------------------------------
// Public / Authenticated General Analytics
// ----------------------------------------------------
router.get('/skill-demand', analyticsController.getSkillDemandAnalytics);

// All subsequent routes require authentication
router.use(authenticate);

// Student Skill Analytics
router.get(
  '/student/skills',
  authorizeRoles(UserRole.STUDENT, UserRole.INSTITUTION),
  analyticsController.getStudentSkillAnalytics
);
router.get(
  '/student/:studentId/skills',
  authorizeRoles(UserRole.STUDENT, UserRole.INSTITUTION),
  analyticsController.getStudentSkillAnalytics
);

// Institution Analytics
router.get(
  '/institution/skills',
  authorizeRoles(UserRole.INSTITUTION),
  analyticsController.getInstitutionSkillAnalytics
);
router.get(
  '/institution/:institutionId/skills',
  authorizeRoles(UserRole.INSTITUTION),
  analyticsController.getInstitutionSkillAnalytics
);
router.get(
  '/institution/placements',
  authorizeRoles(UserRole.INSTITUTION),
  analyticsController.getPlacementAnalytics
);
router.get(
  '/institution/:institutionId/placements',
  authorizeRoles(UserRole.INSTITUTION),
  analyticsController.getPlacementAnalytics
);

// Industry Analytics
router.get(
  '/industry/hiring',
  authorizeRoles(UserRole.INDUSTRY),
  analyticsController.getIndustryHiringAnalytics
);
router.get(
  '/industry/:industryId/hiring',
  authorizeRoles(UserRole.INDUSTRY),
  analyticsController.getIndustryHiringAnalytics
);
router.get(
  '/industry/applications',
  authorizeRoles(UserRole.INDUSTRY),
  analyticsController.getIndustryApplicationAnalytics
);

// Application Analytics (Role-aware)
router.get('/applications', analyticsController.getApplicationAnalytics);

// Academician Dashboard
router.get(
  '/academician/dashboard',
  authorizeRoles(UserRole.ACADEMICIAN),
  analyticsController.getAcademicianDashboard
);

export default router;
