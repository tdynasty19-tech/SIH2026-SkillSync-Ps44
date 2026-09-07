import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { portfolioController } from '../controllers/portfolio.controller';
import { assessmentController } from '../controllers/assessment.controller';
import { careerController } from '../controllers/career.controller';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';
import { studentAffiliationController } from '../controllers/student-affiliation.controller';
import { institutionController } from '../controllers/institution.controller';

const router = Router();

// Protect all student routes: must be authenticated and have STUDENT role
router.use(authenticate);
router.use(authorizeRoles(UserRole.STUDENT));

// ----------------------------------------------------
// 0. Dashboard & Analytics Routes (Phase 15)
// ----------------------------------------------------
router.get('/me/dashboard', analyticsController.getStudentDashboard);
router.get('/me/analytics/skills', analyticsController.getStudentSkillAnalytics);

// ----------------------------------------------------
// 1. Profile Routes
// ----------------------------------------------------
/**
 * @openapi
 * /students/me/profile:
 *   get:
 *     summary: Retrieve current authenticated student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
 *       404:
 *         description: Student profile not found
 */
router.get('/me/profile', studentController.getProfile);
router.post('/me/profile', studentController.createProfile);
router.patch('/me/profile', studentController.updateProfile);

// Institutional affiliation & academic enrollment lifecycle
router.get('/me/affiliations', studentAffiliationController.getMine);
router.get('/me/affiliation', studentAffiliationController.getCurrent);
router.post('/me/affiliations', studentAffiliationController.create);
router.get('/me/academic-context', institutionController.getMyAcademicContext);

// ----------------------------------------------------
// 2. Education Routes
// ----------------------------------------------------
router.get('/me/education', studentController.getEducation);
router.post('/me/education', studentController.addEducation);
router.patch('/me/education/:educationId', studentController.updateEducation);
router.delete('/me/education/:educationId', studentController.deleteEducation);

// ----------------------------------------------------
// 3. Skills Routes
// ----------------------------------------------------
router.get('/me/skills', studentController.getSkills);
router.post('/me/skills', studentController.addSkill);
router.patch('/me/skills/:skillId', studentController.updateSkill);
router.delete('/me/skills/:skillId', studentController.deleteSkill);

// ----------------------------------------------------
// 4. Certifications Routes
// ----------------------------------------------------
router.get('/me/certifications', studentController.getCertifications);
router.post('/me/certifications', studentController.addCertification);
router.patch('/me/certifications/:certificationId', studentController.updateCertification);
router.delete('/me/certifications/:certificationId', studentController.deleteCertification);

// ----------------------------------------------------
// 5. Experience Routes
// ----------------------------------------------------
router.get('/me/experience', studentController.getExperience);
router.post('/me/experience', studentController.addExperience);
router.patch('/me/experience/:experienceId', studentController.updateExperience);
router.delete('/me/experience/:experienceId', studentController.deleteExperience);

// ----------------------------------------------------
// 6. Achievements Routes
// ----------------------------------------------------
router.get('/me/achievements', studentController.getAchievements);
router.post('/me/achievements', studentController.addAchievement);
router.patch('/me/achievements/:achievementId', studentController.updateAchievement);
router.delete('/me/achievements/:achievementId', studentController.deleteAchievement);

// ----------------------------------------------------
// 7. Interests Routes
// ----------------------------------------------------
router.get('/me/interests', studentController.getInterests);
router.post('/me/interests', studentController.addInterest);
router.patch('/me/interests/:interestId', studentController.updateInterest);
router.delete('/me/interests/:interestId', studentController.deleteInterest);

// ----------------------------------------------------
// 8. Languages Routes
// ----------------------------------------------------
router.get('/me/languages', studentController.getLanguages);
router.post('/me/languages', studentController.addLanguage);
router.patch('/me/languages/:languageId', studentController.updateLanguage);
router.delete('/me/languages/:languageId', studentController.deleteLanguage);

// ----------------------------------------------------
// 9. Portfolio Foundation Routes
// ----------------------------------------------------
// 9. Portfolio Foundation & Child Entities
// ----------------------------------------------------
router.get('/me/portfolio', portfolioController.getPortfolio);
router.post('/me/portfolio', portfolioController.createPortfolio);
router.patch('/me/portfolio', portfolioController.updatePortfolio);

// Portfolio Projects
router.get('/me/portfolio/projects', portfolioController.getProjects);
router.post('/me/portfolio/projects', portfolioController.addProject);
router.get('/me/portfolio/projects/:projectId', portfolioController.getProjectById);
router.patch('/me/portfolio/projects/:projectId', portfolioController.updateProject);
router.delete('/me/portfolio/projects/:projectId', portfolioController.deleteProject);

// Portfolio Certifications
router.get('/me/portfolio/certifications', portfolioController.getCertifications);
router.post('/me/portfolio/certifications', portfolioController.addCertification);
router.get('/me/portfolio/certifications/:certId', portfolioController.getCertificationById);
router.patch('/me/portfolio/certifications/:certId', portfolioController.updateCertification);
router.delete('/me/portfolio/certifications/:certId', portfolioController.deleteCertification);

// Portfolio Achievements
router.get('/me/portfolio/achievements', portfolioController.getAchievements);
router.post('/me/portfolio/achievements', portfolioController.addAchievement);
router.get('/me/portfolio/achievements/:achievementId', portfolioController.getAchievementById);
router.patch('/me/portfolio/achievements/:achievementId', portfolioController.updateAchievement);
router.delete('/me/portfolio/achievements/:achievementId', portfolioController.deleteAchievement);

// Portfolio Experiences
router.get('/me/portfolio/experiences', portfolioController.getExperiences);
router.post('/me/portfolio/experiences', portfolioController.addExperience);
router.get('/me/portfolio/experiences/:expId', portfolioController.getExperienceById);
router.patch('/me/portfolio/experiences/:expId', portfolioController.updateExperience);
router.delete('/me/portfolio/experiences/:expId', portfolioController.deleteExperience);

// Portfolio Documents
router.get('/me/portfolio/documents', portfolioController.getDocuments);
router.post('/me/portfolio/documents', portfolioController.addDocument);
router.get('/me/portfolio/documents/:docId', portfolioController.getDocumentById);
router.patch('/me/portfolio/documents/:docId', portfolioController.updateDocument);
router.delete('/me/portfolio/documents/:docId', portfolioController.deleteDocument);

// ----------------------------------------------------
// 10. Assessment Attempts History
// ----------------------------------------------------
router.get('/me/assessment-attempts', assessmentController.getStudentAttempts);

// ----------------------------------------------------
// 11. Career Interests Routes
// ----------------------------------------------------
router.get('/me/career-interests', careerController.getStudentCareerInterests);
router.post('/me/career-interests', careerController.addCareerInterest);
router.patch('/me/career-interests/:interestId', careerController.updateCareerInterest);
router.delete('/me/career-interests/:interestId', careerController.deleteCareerInterest);

// ----------------------------------------------------
// 12. Skill Gaps Routes
// ----------------------------------------------------
router.get('/me/skill-gaps', careerController.getStudentGaps);
router.post('/me/skill-gaps/recalculate', careerController.recalculateGaps);

export default router;
