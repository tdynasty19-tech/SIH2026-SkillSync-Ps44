import { Router } from 'express';
import { healthRoutes } from './health.routes';

import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import skillRoutes from './skill.routes';
import skillCategoryRoutes from './skill-category.routes';
import assessmentRoutes from './assessment.routes';
import careerRoutes from './career.routes';
import jobRoutes from './job.routes';
import internshipRoutes from './internship.routes';
import projectRoutes from './project.routes';
import learningProgramRoutes from './learning-program.routes';
import facultyOpportunityRoutes from './faculty-opportunity.routes';
import fdpRoutes from './fdp.routes';
import researchOpportunityRoutes from './research-opportunity.routes';
import consultancyOpportunityRoutes from './consultancy-opportunity.routes';
import applicationRoutes from './application.routes';
import industryRoutes from './industry.routes';
import academicianRoutes from './academician.routes';
import institutionRoutes from './institution.routes';
import collaborationRoutes from './collaboration.routes';
import mentorshipRoutes from './mentorship.routes';
import documentRoutes from './document.routes';
import notificationRoutes from './notification.routes';
import matchingRoutes from './matching.routes';
import recommendationRoutes from './recommendation.routes';
import analyticsRoutes from './analytics.routes';
import aiRoutes from './ai.routes';
import searchRoutes from './search.routes';

const router = Router();

// Mount system routes
router.use('/health', healthRoutes);

// Feature routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/skills', skillRoutes);
router.use('/skill-categories', skillCategoryRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/careers', careerRoutes);

// Opportunity routes
router.use('/jobs', jobRoutes);
router.use('/internships', internshipRoutes);
router.use('/projects', projectRoutes);
router.use('/learning-programs', learningProgramRoutes);
router.use('/faculty-opportunities', facultyOpportunityRoutes);
router.use('/fdps', fdpRoutes);
router.use('/research-opportunities', researchOpportunityRoutes);
router.use('/consultancy-opportunities', consultancyOpportunityRoutes);

// Application routes
router.use('/applications', applicationRoutes);

// Industry routes
router.use('/industry', industryRoutes);

// Academician routes
router.use('/academician', academicianRoutes);

// Institution routes (both plural and singular aliases supported)
router.use('/institutions', institutionRoutes);
router.use('/institution', institutionRoutes);

// Collaboration routes
router.use('/collaborations', collaborationRoutes);

// Mentorship routes
router.use('/mentorship', mentorshipRoutes);

// Document routes
router.use('/documents', documentRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Matching & Recommendation routes (Phase 14)
router.use('/matching', matchingRoutes);
router.use('/recommendations', recommendationRoutes);

// Analytics & Dashboard routes (Phase 15)
router.use('/analytics', analyticsRoutes);

// AI Integration Layer (Phase 16)
router.use('/ai', aiRoutes);

// Global Search (Phase 17)
router.use('/search', searchRoutes);

export const apiV1Routes = router;

