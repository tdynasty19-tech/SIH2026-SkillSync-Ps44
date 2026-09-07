import { sequelize } from '../config/database';

// Import Core Models
import { User } from './user.model';
import { RefreshToken } from './refresh-token.model';

// Import Student Domain Models
import { StudentProfile } from './student-profile.model';
import { StudentEducation } from './student-education.model';
import { StudentSkill } from './student-skill.model';
import { StudentCertification } from './student-certification.model';
import { StudentExperience } from './student-experience.model';
import { StudentAchievement } from './student-achievement.model';
import { StudentInterest } from './student-interest.model';
import { StudentLanguage } from './student-language.model';
import { StudentInstitutionAffiliation } from './student-institution-affiliation.model';

// Import Skill Intelligence Models
import { SkillCategory } from './skill-category.model';
import { Skill } from './skill.model';
import { SkillAssessment } from './skill-assessment.model';
import { AssessmentQuestion } from './assessment-question.model';
import { AssessmentAttempt } from './assessment-attempt.model';
import { AssessmentAnswer } from './assessment-answer.model';
import { SkillGap } from './skill-gap.model';

// Import Career Domain Models
import { CareerRole } from './career-role.model';
import { CareerRoleSkill } from './career-role-skill.model';
import { StudentCareerInterest } from './student-career-interest.model';

// Import Industry Domain Models
import { IndustryProfile } from './industry-profile.model';
import { IndustryContact } from './industry-contact.model';

// Import Institution Domain Models
import { InstitutionProfile } from './institution-profile.model';
import { InstitutionDepartment } from './institution-department.model';
import { AcademicProgram } from './academic-program.model';
import { AcademicBatch } from './academic-batch.model';
import { StudentAcademicEnrollment } from './student-academic-enrollment.model';
import { Placement } from './placement.model';
import { PlacementRecord } from './placement-record.model';
import { SkillAnalytics } from './skill-analytics.model';
import { IndustryConnection } from './industry-connection.model';

// Import Academician Domain Models
import { AcademicianProfile } from './academician-profile.model';
import { AcademicInstitutionAssociation } from './academic-institution-association.model';

// Import Opportunity Domain Models
import { Job } from './job.model';
import { Internship } from './internship.model';
import { Project } from './project.model';
import { LearningProgram } from './learning-program.model';
import { FacultyOpportunity } from './faculty-opportunity.model';
import { FDP } from './fdp.model';
import { ResearchOpportunity } from './research-opportunity.model';
import { ConsultancyOpportunity } from './consultancy-opportunity.model';

// Import Application Domain Models
import { Application } from './application.model';
import { ApplicationStatusHistory } from './application-status-history.model';

// Import Collaboration Domain Models
import { Collaboration } from './collaboration.model';
import { Workshop } from './workshop.model';
import { GuestLecture } from './guest-lecture.model';
import { IndustrialTraining } from './industrial-training.model';
import { LiveProject } from './live-project.model';

// Import Mentorship Domain Models
import { Mentor } from './mentor.model';
import { MentorshipRequest } from './mentorship-request.model';
import { MentorshipSession } from './mentorship-session.model';

// Import Portfolio Domain Models
import { Portfolio } from './portfolio.model';
import { PortfolioProject } from './portfolio-project.model';
import { PortfolioCertification } from './portfolio-certification.model';
import { PortfolioAchievement } from './portfolio-achievement.model';
import { PortfolioExperience } from './portfolio-experience.model';
import { PortfolioDocument } from './portfolio-document.model';

// Import Document Domain Models
import { Document } from './document.model';
import { DocumentAccess } from './document-access.model';

// Import Notification, AI & Audit Models
import { Notification } from './notification.model';
import { AIAnalysis } from './ai-analysis.model';
import { CareerRecommendation } from './career-recommendation.model';
import { OpportunityMatch } from './opportunity-match.model';
import { LearningRecommendation } from './learning-recommendation.model';
import { AuditLog } from './audit-log.model';

// ==========================================
// MODEL ASSOCIATIONS (Strictly Master Prompt)
// ==========================================

// 1. User Relationships
User.hasOne(StudentProfile, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(IndustryProfile, { foreignKey: 'userId', as: 'industryProfile', onDelete: 'CASCADE' });
IndustryProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(InstitutionProfile, { foreignKey: 'userId', as: 'institutionProfile', onDelete: 'CASCADE' });
InstitutionProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(AcademicianProfile, { foreignKey: 'userId', as: 'academicianProfile', onDelete: 'CASCADE' });
AcademicianProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Mentor, { foreignKey: 'userId', as: 'mentorProfile', onDelete: 'CASCADE' });
Mentor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Document, { foreignKey: 'ownerUserId', as: 'ownedDocuments', onDelete: 'CASCADE' });
Document.belongsTo(User, { foreignKey: 'ownerUserId', as: 'owner' });

User.hasMany(DocumentAccess, { foreignKey: 'granteeUserId', as: 'documentAccesses', onDelete: 'CASCADE' });
DocumentAccess.belongsTo(User, { foreignKey: 'granteeUserId', as: 'grantee' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(StudentInstitutionAffiliation, { foreignKey: 'reviewedByUserId', as: 'reviewedStudentAffiliations', onDelete: 'SET NULL' });
StudentInstitutionAffiliation.belongsTo(User, { foreignKey: 'reviewedByUserId', as: 'reviewedBy' });

User.hasMany(AIAnalysis, { foreignKey: 'userId', as: 'aiAnalyses', onDelete: 'CASCADE' });
AIAnalysis.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 2. StudentProfile Relationships
StudentProfile.hasMany(StudentEducation, { foreignKey: 'studentId', as: 'education', onDelete: 'CASCADE' });
StudentEducation.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentSkill, { foreignKey: 'studentId', as: 'skills', onDelete: 'CASCADE' });
StudentSkill.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentCertification, { foreignKey: 'studentId', as: 'certifications', onDelete: 'CASCADE' });
StudentCertification.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentExperience, { foreignKey: 'studentId', as: 'experiences', onDelete: 'CASCADE' });
StudentExperience.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentAchievement, { foreignKey: 'studentId', as: 'achievements', onDelete: 'CASCADE' });
StudentAchievement.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentInterest, { foreignKey: 'studentId', as: 'interests', onDelete: 'CASCADE' });
StudentInterest.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentLanguage, { foreignKey: 'studentId', as: 'languages', onDelete: 'CASCADE' });
StudentLanguage.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(AssessmentAttempt, { foreignKey: 'studentId', as: 'assessmentAttempts', onDelete: 'RESTRICT' });
AssessmentAttempt.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(SkillGap, { foreignKey: 'studentId', as: 'skillGaps', onDelete: 'CASCADE' });
SkillGap.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(StudentCareerInterest, { foreignKey: 'studentId', as: 'careerInterests', onDelete: 'CASCADE' });
StudentCareerInterest.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(Application, { foreignKey: 'studentId', as: 'applications', onDelete: 'RESTRICT' });
Application.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(MentorshipRequest, { foreignKey: 'studentId', as: 'mentorshipRequests', onDelete: 'CASCADE' });
MentorshipRequest.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasOne(Portfolio, { foreignKey: 'studentId', as: 'portfolio', onDelete: 'CASCADE' });
Portfolio.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(CareerRecommendation, { foreignKey: 'studentId', as: 'careerRecommendations', onDelete: 'CASCADE' });
CareerRecommendation.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(OpportunityMatch, { foreignKey: 'studentId', as: 'opportunityMatches', onDelete: 'CASCADE' });
OpportunityMatch.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(LearningRecommendation, { foreignKey: 'studentId', as: 'learningRecommendations', onDelete: 'CASCADE' });
LearningRecommendation.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.hasMany(PlacementRecord, { foreignKey: 'studentId', as: 'placementRecords', onDelete: 'RESTRICT' });
PlacementRecord.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

StudentProfile.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });
InstitutionProfile.hasMany(StudentProfile, { foreignKey: 'institutionId', as: 'students', onDelete: 'SET NULL' });

StudentProfile.belongsTo(InstitutionDepartment, { foreignKey: 'departmentId', as: 'departmentRecord' });
InstitutionDepartment.hasMany(StudentProfile, { foreignKey: 'departmentId', as: 'students', onDelete: 'SET NULL' });

StudentProfile.hasMany(StudentInstitutionAffiliation, { foreignKey: 'studentId', as: 'institutionAffiliations', onDelete: 'CASCADE' });
StudentInstitutionAffiliation.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

// 3. Skill & Category Relationships
SkillCategory.hasMany(Skill, { foreignKey: 'categoryId', as: 'skills', onDelete: 'SET NULL' });
Skill.belongsTo(SkillCategory, { foreignKey: 'categoryId', as: 'category' });

Skill.hasMany(StudentSkill, { foreignKey: 'skillId', as: 'studentSkills', onDelete: 'CASCADE' });
StudentSkill.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

Skill.hasMany(SkillAssessment, { foreignKey: 'skillId', as: 'assessments', onDelete: 'CASCADE' });
SkillAssessment.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

Skill.hasMany(CareerRoleSkill, { foreignKey: 'skillId', as: 'roleSkills', onDelete: 'CASCADE' });
CareerRoleSkill.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

Skill.hasMany(SkillGap, { foreignKey: 'skillId', as: 'gaps', onDelete: 'CASCADE' });
SkillGap.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

Skill.hasMany(SkillAnalytics, { foreignKey: 'skillId', as: 'analytics', onDelete: 'CASCADE' });
SkillAnalytics.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

Skill.hasMany(LearningRecommendation, { foreignKey: 'skillId', as: 'learningRecommendations', onDelete: 'CASCADE' });
LearningRecommendation.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

// 4. Assessment Relationships
SkillAssessment.hasMany(AssessmentQuestion, { foreignKey: 'assessmentId', as: 'questions', onDelete: 'CASCADE' });
AssessmentQuestion.belongsTo(SkillAssessment, { foreignKey: 'assessmentId', as: 'assessment' });

SkillAssessment.hasMany(AssessmentAttempt, { foreignKey: 'assessmentId', as: 'attempts', onDelete: 'CASCADE' });
AssessmentAttempt.belongsTo(SkillAssessment, { foreignKey: 'assessmentId', as: 'assessment' });

AssessmentAttempt.hasMany(AssessmentAnswer, { foreignKey: 'attemptId', as: 'answers', onDelete: 'CASCADE' });
AssessmentAnswer.belongsTo(AssessmentAttempt, { foreignKey: 'attemptId', as: 'attempt' });

AssessmentQuestion.hasMany(AssessmentAnswer, { foreignKey: 'questionId', as: 'answers', onDelete: 'CASCADE' });
AssessmentAnswer.belongsTo(AssessmentQuestion, { foreignKey: 'questionId', as: 'question' });

// 5. Career Role Relationships
CareerRole.hasMany(CareerRoleSkill, { foreignKey: 'careerRoleId', as: 'roleSkills', onDelete: 'CASCADE' });
CareerRoleSkill.belongsTo(CareerRole, { foreignKey: 'careerRoleId', as: 'careerRole' });

CareerRole.hasMany(StudentCareerInterest, { foreignKey: 'careerRoleId', as: 'studentInterests', onDelete: 'CASCADE' });
StudentCareerInterest.belongsTo(CareerRole, { foreignKey: 'careerRoleId', as: 'careerRole' });

CareerRole.hasMany(SkillGap, { foreignKey: 'targetRoleId', as: 'targetRoleSkillGaps', onDelete: 'SET NULL' });
SkillGap.belongsTo(CareerRole, { foreignKey: 'targetRoleId', as: 'targetRole' });

CareerRole.hasMany(CareerRecommendation, { foreignKey: 'careerRoleId', as: 'recommendations', onDelete: 'CASCADE' });
CareerRecommendation.belongsTo(CareerRole, { foreignKey: 'careerRoleId', as: 'careerRole' });

// 6. IndustryProfile Relationships
IndustryProfile.hasMany(IndustryContact, { foreignKey: 'industryId', as: 'contacts', onDelete: 'CASCADE' });
IndustryContact.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(Job, { foreignKey: 'industryId', as: 'jobs', onDelete: 'CASCADE' });
Job.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(Internship, { foreignKey: 'industryId', as: 'internships', onDelete: 'CASCADE' });
Internship.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(Project, { foreignKey: 'industryId', as: 'projects', onDelete: 'SET NULL' });
Project.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(LearningProgram, { foreignKey: 'industryId', as: 'learningPrograms', onDelete: 'SET NULL' });
LearningProgram.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(FacultyOpportunity, { foreignKey: 'industryId', as: 'facultyOpportunities', onDelete: 'SET NULL' });
FacultyOpportunity.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(FDP, { foreignKey: 'industryId', as: 'fdps', onDelete: 'SET NULL' });
FDP.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(ResearchOpportunity, { foreignKey: 'industryId', as: 'researchOpportunities', onDelete: 'SET NULL' });
ResearchOpportunity.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(ConsultancyOpportunity, { foreignKey: 'industryId', as: 'consultancyOpportunities', onDelete: 'SET NULL' });
ConsultancyOpportunity.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(Collaboration, { foreignKey: 'industryId', as: 'collaborations', onDelete: 'CASCADE' });
Collaboration.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

IndustryProfile.hasMany(IndustryConnection, { foreignKey: 'industryId', as: 'connections', onDelete: 'CASCADE' });
IndustryConnection.belongsTo(IndustryProfile, { foreignKey: 'industryId', as: 'industry' });

// 7. InstitutionProfile Relationships
InstitutionProfile.hasMany(InstitutionDepartment, { foreignKey: 'institutionId', as: 'departments', onDelete: 'CASCADE' });
InstitutionDepartment.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionDepartment.hasMany(AcademicProgram, { foreignKey: 'departmentId', as: 'programs', onDelete: 'CASCADE' });
AcademicProgram.belongsTo(InstitutionDepartment, { foreignKey: 'departmentId', as: 'department' });

InstitutionProfile.hasMany(AcademicProgram, { foreignKey: 'institutionId', as: 'academicPrograms', onDelete: 'CASCADE' });
AcademicProgram.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

AcademicProgram.hasMany(AcademicBatch, { foreignKey: 'programId', as: 'batches', onDelete: 'CASCADE' });
AcademicBatch.belongsTo(AcademicProgram, { foreignKey: 'programId', as: 'program' });

InstitutionDepartment.hasMany(AcademicBatch, { foreignKey: 'departmentId', as: 'batches', onDelete: 'CASCADE' });
AcademicBatch.belongsTo(InstitutionDepartment, { foreignKey: 'departmentId', as: 'department' });

InstitutionProfile.hasMany(AcademicBatch, { foreignKey: 'institutionId', as: 'batches', onDelete: 'CASCADE' });
AcademicBatch.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

AcademicBatch.hasMany(StudentAcademicEnrollment, { foreignKey: 'batchId', as: 'enrollments', onDelete: 'CASCADE' });
StudentAcademicEnrollment.belongsTo(AcademicBatch, { foreignKey: 'batchId', as: 'batch' });

StudentProfile.hasMany(StudentAcademicEnrollment, { foreignKey: 'studentId', as: 'academicEnrollments', onDelete: 'CASCADE' });
StudentAcademicEnrollment.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

AcademicProgram.hasMany(StudentAcademicEnrollment, { foreignKey: 'programId', as: 'enrollments', onDelete: 'CASCADE' });
StudentAcademicEnrollment.belongsTo(AcademicProgram, { foreignKey: 'programId', as: 'program' });

InstitutionProfile.hasMany(StudentAcademicEnrollment, { foreignKey: 'institutionId', as: 'studentEnrollments', onDelete: 'CASCADE' });
StudentAcademicEnrollment.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionDepartment.hasMany(StudentAcademicEnrollment, { foreignKey: 'departmentId', as: 'studentEnrollments', onDelete: 'CASCADE' });
StudentAcademicEnrollment.belongsTo(InstitutionDepartment, { foreignKey: 'departmentId', as: 'department' });

InstitutionProfile.hasMany(AcademicianProfile, { foreignKey: 'institutionId', as: 'academicians', onDelete: 'SET NULL' });
AcademicianProfile.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionDepartment.hasMany(AcademicianProfile, { foreignKey: 'departmentId', as: 'academicians', onDelete: 'SET NULL' });
AcademicianProfile.belongsTo(InstitutionDepartment, { foreignKey: 'departmentId', as: 'departmentRecord' });

InstitutionProfile.hasMany(Placement, { foreignKey: 'institutionId', as: 'placements', onDelete: 'CASCADE' });
Placement.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(SkillAnalytics, { foreignKey: 'institutionId', as: 'skillAnalytics', onDelete: 'CASCADE' });
SkillAnalytics.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(IndustryConnection, { foreignKey: 'institutionId', as: 'industryConnections', onDelete: 'CASCADE' });
IndustryConnection.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(Collaboration, { foreignKey: 'institutionId', as: 'collaborations', onDelete: 'CASCADE' });
Collaboration.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(AcademicInstitutionAssociation, { foreignKey: 'institutionId', as: 'academicAssociations', onDelete: 'CASCADE' });
AcademicInstitutionAssociation.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(StudentInstitutionAffiliation, { foreignKey: 'institutionId', as: 'studentAffiliations', onDelete: 'CASCADE' });
StudentInstitutionAffiliation.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionDepartment.hasMany(StudentInstitutionAffiliation, { foreignKey: 'departmentId', as: 'studentAffiliations', onDelete: 'RESTRICT' });
StudentInstitutionAffiliation.belongsTo(InstitutionDepartment, { foreignKey: 'departmentId', as: 'department' });

InstitutionProfile.hasMany(LearningProgram, { foreignKey: 'institutionId', as: 'learningPrograms', onDelete: 'SET NULL' });
LearningProgram.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(FacultyOpportunity, { foreignKey: 'institutionId', as: 'facultyOpportunities', onDelete: 'SET NULL' });
FacultyOpportunity.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(FDP, { foreignKey: 'institutionId', as: 'fdps', onDelete: 'SET NULL' });
FDP.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

InstitutionProfile.hasMany(ResearchOpportunity, { foreignKey: 'institutionId', as: 'researchOpportunities', onDelete: 'SET NULL' });
ResearchOpportunity.belongsTo(InstitutionProfile, { foreignKey: 'institutionId', as: 'institution' });

// 8. AcademicianProfile Relationships
AcademicianProfile.hasMany(AcademicInstitutionAssociation, { foreignKey: 'academicianId', as: 'associations', onDelete: 'CASCADE' });
AcademicInstitutionAssociation.belongsTo(AcademicianProfile, { foreignKey: 'academicianId', as: 'academician' });

// 9. Application Relationships
Application.hasMany(ApplicationStatusHistory, { foreignKey: 'applicationId', as: 'statusHistory', onDelete: 'CASCADE' });
ApplicationStatusHistory.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
User.hasMany(ApplicationStatusHistory, { foreignKey: 'changedByUserId', as: 'statusChanges', onDelete: 'SET NULL' });
ApplicationStatusHistory.belongsTo(User, { foreignKey: 'changedByUserId', as: 'changedByUser' });

// 10. Placement Relationships
Placement.hasMany(PlacementRecord, { foreignKey: 'placementId', as: 'records', onDelete: 'CASCADE' });
PlacementRecord.belongsTo(Placement, { foreignKey: 'placementId', as: 'placement' });

// 11. Collaboration Sub-models Relationships
Collaboration.hasMany(Workshop, { foreignKey: 'collaborationId', as: 'workshops', onDelete: 'CASCADE' });
Workshop.belongsTo(Collaboration, { foreignKey: 'collaborationId', as: 'collaboration' });

Collaboration.hasMany(GuestLecture, { foreignKey: 'collaborationId', as: 'guestLectures', onDelete: 'CASCADE' });
GuestLecture.belongsTo(Collaboration, { foreignKey: 'collaborationId', as: 'collaboration' });

Collaboration.hasMany(IndustrialTraining, { foreignKey: 'collaborationId', as: 'industrialTrainings', onDelete: 'CASCADE' });
IndustrialTraining.belongsTo(Collaboration, { foreignKey: 'collaborationId', as: 'collaboration' });

Collaboration.hasMany(LiveProject, { foreignKey: 'collaborationId', as: 'liveProjects', onDelete: 'CASCADE' });
LiveProject.belongsTo(Collaboration, { foreignKey: 'collaborationId', as: 'collaboration' });

// 12. Mentorship Relationships
Mentor.hasMany(MentorshipRequest, { foreignKey: 'mentorId', as: 'requests', onDelete: 'CASCADE' });
MentorshipRequest.belongsTo(Mentor, { foreignKey: 'mentorId', as: 'mentor' });

MentorshipRequest.hasMany(MentorshipSession, { foreignKey: 'mentorshipRequestId', as: 'sessions', onDelete: 'CASCADE' });
MentorshipSession.belongsTo(MentorshipRequest, { foreignKey: 'mentorshipRequestId', as: 'request' });

// 13. Portfolio Relationships
Portfolio.hasMany(PortfolioProject, { foreignKey: 'portfolioId', as: 'projects', onDelete: 'CASCADE' });
PortfolioProject.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

Portfolio.hasMany(PortfolioCertification, { foreignKey: 'portfolioId', as: 'certifications', onDelete: 'CASCADE' });
PortfolioCertification.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

Portfolio.hasMany(PortfolioAchievement, { foreignKey: 'portfolioId', as: 'achievements', onDelete: 'CASCADE' });
PortfolioAchievement.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

Portfolio.hasMany(PortfolioExperience, { foreignKey: 'portfolioId', as: 'experiences', onDelete: 'CASCADE' });
PortfolioExperience.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

Portfolio.hasMany(PortfolioDocument, { foreignKey: 'portfolioId', as: 'documents', onDelete: 'CASCADE' });
PortfolioDocument.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

// 14. Document Relationships
Document.hasMany(DocumentAccess, { foreignKey: 'documentId', as: 'accessGrants', onDelete: 'CASCADE' });
DocumentAccess.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

// ==========================================
// CENTRAL EXPORT REGISTRY
// ==========================================
export const models = {
  User,
  RefreshToken,
  StudentProfile,
  StudentEducation,
  StudentSkill,
  StudentCertification,
  StudentExperience,
  StudentAchievement,
  StudentInterest,
  StudentLanguage,
  SkillCategory,
  Skill,
  SkillAssessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentAnswer,
  SkillGap,
  CareerRole,
  CareerRoleSkill,
  StudentCareerInterest,
  IndustryProfile,
  IndustryContact,
  InstitutionProfile,
  InstitutionDepartment,
  AcademicianProfile,
  AcademicInstitutionAssociation,
  Job,
  Internship,
  Project,
  LearningProgram,
  FacultyOpportunity,
  FDP,
  ResearchOpportunity,
  ConsultancyOpportunity,
  Application,
  ApplicationStatusHistory,
  Placement,
  PlacementRecord,
  SkillAnalytics,
  IndustryConnection,
  Collaboration,
  Workshop,
  GuestLecture,
  IndustrialTraining,
  LiveProject,
  Mentor,
  MentorshipRequest,
  MentorshipSession,
  Portfolio,
  PortfolioProject,
  PortfolioCertification,
  PortfolioAchievement,
  PortfolioExperience,
  PortfolioDocument,
  Document,
  DocumentAccess,
  Notification,
  AIAnalysis,
  CareerRecommendation,
  OpportunityMatch,
  LearningRecommendation,
  AuditLog,
};

export {
  sequelize,
  User,
  RefreshToken,
  StudentProfile,
  StudentEducation,
  StudentSkill,
  StudentCertification,
  StudentExperience,
  StudentAchievement,
  StudentInterest,
  StudentLanguage,
  SkillCategory,
  Skill,
  SkillAssessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentAnswer,
  SkillGap,
  CareerRole,
  CareerRoleSkill,
  StudentCareerInterest,
  IndustryProfile,
  IndustryContact,
  InstitutionProfile,
  InstitutionDepartment,
  AcademicProgram,
  AcademicBatch,
  StudentAcademicEnrollment,
  AcademicianProfile,
  AcademicInstitutionAssociation,
  Job,
  Internship,
  Project,
  LearningProgram,
  FacultyOpportunity,
  FDP,
  ResearchOpportunity,
  ConsultancyOpportunity,
  Application,
  ApplicationStatusHistory,
  Placement,
  PlacementRecord,
  SkillAnalytics,
  IndustryConnection,
  Collaboration,
  Workshop,
  GuestLecture,
  IndustrialTraining,
  LiveProject,
  Mentor,
  MentorshipRequest,
  MentorshipSession,
  Portfolio,
  PortfolioProject,
  PortfolioCertification,
  PortfolioAchievement,
  PortfolioExperience,
  PortfolioDocument,
  Document,
  DocumentAccess,
  Notification,
  AIAnalysis,
  CareerRecommendation,
  OpportunityMatch,
  LearningRecommendation,
  AuditLog,
};

export default models;
