import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { RouteLoadingSpinner } from '../components/ui/RouteLoadingSpinner';

// Layouts (Statically imported for seamless shell transitions)
import { PublicLayout } from '../components/layouts/PublicLayout';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { StudentLayout } from '../components/layouts/StudentLayout';
import { IndustryLayout } from '../components/layouts/IndustryLayout';
import { AcademicianLayout } from '../components/layouts/AcademicianLayout';
import { InstitutionLayout } from '../components/layouts/InstitutionLayout';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('../pages/public/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const OpportunitiesPage = lazy(() => import('../pages/public/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const ContactPage = lazy(() => import('../pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));

// Auth Pages (Lazy Loaded)
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const RoleSelectionPage = lazy(() => import('../pages/auth/RoleSelectionPage').then(m => ({ default: m.RoleSelectionPage })));

// Student Pages (Lazy Loaded)
const StudentDashboardPage = lazy(() => import('../pages/student/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const SkillProfilePage = lazy(() => import('../pages/student/SkillProfilePage').then(m => ({ default: m.SkillProfilePage })));
const SkillGapAnalysisPage = lazy(() => import('../pages/student/SkillGapAnalysisPage').then(m => ({ default: m.SkillGapAnalysisPage })));
const CareerExplorerPage = lazy(() => import('../pages/student/CareerExplorerPage').then(m => ({ default: m.CareerExplorerPage })));
const SkillAssessmentPage = lazy(() => import('../pages/student/SkillAssessmentPage').then(m => ({ default: m.SkillAssessmentPage })));
const SkillAssessmentTestPage = lazy(() => import('../pages/student/SkillAssessmentTestPage').then(m => ({ default: m.SkillAssessmentTestPage })));
const JobPortalPage = lazy(() => import('../pages/student/JobPortalPage').then(m => ({ default: m.JobPortalPage })));
const ApplicationTrackerPage = lazy(() => import('../pages/student/ApplicationTrackerPage').then(m => ({ default: m.ApplicationTrackerPage })));
const DigitalPortfolioPage = lazy(() => import('../pages/student/DigitalPortfolioPage').then(m => ({ default: m.DigitalPortfolioPage })));
const StudentAffiliationPage = lazy(() => import('../pages/student/StudentAffiliationPage').then(m => ({ default: m.StudentAffiliationPage })));

// Industry Pages (Lazy Loaded)
const IndustryDashboardPage = lazy(() => import('../pages/industry/IndustryDashboardPage').then(m => ({ default: m.IndustryDashboardPage })));
const PostOpportunityPage = lazy(() => import('../pages/industry/PostOpportunityPage').then(m => ({ default: m.PostOpportunityPage })));
const CandidateDiscoveryPage = lazy(() => import('../pages/industry/CandidateDiscoveryPage').then(m => ({ default: m.CandidateDiscoveryPage })));
const ApplicationPipelinePage = lazy(() => import('../pages/industry/ApplicationPipelinePage').then(m => ({ default: m.ApplicationPipelinePage })));

// Academician Pages (Lazy Loaded)
const AcademicianDashboardPage = lazy(() => import('../pages/academician/AcademicianDashboardPage').then(m => ({ default: m.AcademicianDashboardPage })));
const FacultyInternshipsPage = lazy(() => import('../pages/academician/FacultyInternshipsPage').then(m => ({ default: m.FacultyInternshipsPage })));
const ResearchCollaborationPage = lazy(() => import('../pages/academician/ResearchCollaborationPage').then(m => ({ default: m.ResearchCollaborationPage })));

// Institution Pages (Lazy Loaded)
const InstitutionDashboardPage = lazy(() => import('../pages/institution/InstitutionDashboardPage').then(m => ({ default: m.InstitutionDashboardPage })));
const SkillIntelligencePage = lazy(() => import('../pages/institution/SkillIntelligencePage').then(m => ({ default: m.SkillIntelligencePage })));
const PlacementAnalyticsPage = lazy(() => import('../pages/institution/PlacementAnalyticsPage').then(m => ({ default: m.PlacementAnalyticsPage })));
const ReportsGeneratorPage = lazy(() => import('../pages/institution/ReportsGeneratorPage').then(m => ({ default: m.ReportsGeneratorPage })));
const StudentAffiliationReviewPage = lazy(() => import('../pages/institution/StudentAffiliationReviewPage').then(m => ({ default: m.StudentAffiliationReviewPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:role" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Student Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route path="/student/skills" element={<SkillProfilePage />} />
              <Route path="/student/skill-gap" element={<SkillGapAnalysisPage />} />
              <Route path="/student/career" element={<CareerExplorerPage />} />
              <Route path="/student/assessments" element={<SkillAssessmentPage />} />
              <Route path="/student/assessments/:assessmentId/attempt/:attemptId" element={<SkillAssessmentTestPage />} />
              <Route path="/student/jobs" element={<JobPortalPage />} />
              <Route path="/student/applications" element={<ApplicationTrackerPage />} />
              <Route path="/student/portfolio" element={<DigitalPortfolioPage />} />
              <Route path="/student/affiliation" element={<StudentAffiliationPage />} />
            </Route>
          </Route>

          {/* Industry Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['industry']} />}>
            <Route element={<IndustryLayout />}>
              <Route path="/industry/dashboard" element={<IndustryDashboardPage />} />
              <Route path="/industry/post-opportunity" element={<PostOpportunityPage />} />
              <Route path="/industry/candidates" element={<CandidateDiscoveryPage />} />
              <Route path="/industry/applications" element={<ApplicationPipelinePage />} />
            </Route>
          </Route>

          {/* Academician Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['academician']} />}>
            <Route element={<AcademicianLayout />}>
              <Route path="/academician/dashboard" element={<AcademicianDashboardPage />} />
              <Route path="/academician/internships" element={<FacultyInternshipsPage />} />
              <Route path="/academician/research" element={<ResearchCollaborationPage />} />
            </Route>
          </Route>

          {/* Institution Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['institution']} />}>
            <Route element={<InstitutionLayout />}>
              <Route path="/institution/dashboard" element={<InstitutionDashboardPage />} />
              <Route path="/institution/skill-intelligence" element={<SkillIntelligencePage />} />
              <Route path="/institution/placements" element={<PlacementAnalyticsPage />} />
              <Route path="/institution/reports" element={<ReportsGeneratorPage />} />
              <Route path="/institution/student-affiliations" element={<StudentAffiliationReviewPage />} />
            </Route>
          </Route>
        </Route>

        {/* Branded Fallback Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
