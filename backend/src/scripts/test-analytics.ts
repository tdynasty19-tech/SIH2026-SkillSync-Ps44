import assert from 'assert';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { SkillGap } from '../models/skill-gap.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { Application } from '../models/application.model';
import { Placement } from '../models/placement.model';
import { PlacementRecord } from '../models/placement-record.model';
import { Collaboration } from '../models/collaboration.model';
import { IndustryConnection } from '../models/industry-connection.model';
import { UserRole } from '../constants/roles';
import {
  StudentSkillLevel,
  OpportunityStatus,
  OpportunityType,
  WorkplaceType,
  EmploymentType,
  AssessmentAttemptStatus,
  SkillGapPriority,
  SkillGapStatus,
  ApplicationStatus,
  AssessmentQuestionType,
  CollaborationType,
  CollaborationStatus,
  StudentAffiliationStatus,
} from '../constants/enums';
import { analyticsService } from '../services/analytics.service';
import { dateRangeFilterSchema } from '../validators/analytics.validator';

export const runPhase15Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 15 ANALYTICS & DASHBOARD TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) {
        console.error(err.stack);
      }
      failed++;
    }
  };

  const ts = Date.now();
  const hash = await bcrypt.hash('TestPass123!', 10);

  // ----------------------------------------------------
  // Setup Test Fixtures: Skills, Categories, Career Roles
  // ----------------------------------------------------
  let category = await SkillCategory.findOne({ where: { name: 'Analytics Domain' } });
  if (!category) {
    category = await SkillCategory.create({
      name: `Analytics Domain ${ts}`,
      description: 'Domain for analytics tests',
    });
  }

  const skillPython = await Skill.create({
    name: `Python-P15-${ts}`,
    slug: `python-p15-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  const skillSQL = await Skill.create({
    name: `SQL-P15-${ts}`,
    slug: `sql-p15-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  const skillReact = await Skill.create({
    name: `React-P15-${ts}`,
    slug: `react-p15-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  const roleDataEngineer = await CareerRole.create({
    title: `Data Engineer ${ts}`,
    slug: `data-engineer-${ts}`,
    description: 'Data engineering analytics role',
  });

  await CareerRoleSkill.create({
    careerRoleId: roleDataEngineer.id,
    skillId: skillPython.id,
    requiredLevel: StudentSkillLevel.ADVANCED,
    importanceWeight: 1.0,
  });
  await CareerRoleSkill.create({
    careerRoleId: roleDataEngineer.id,
    skillId: skillSQL.id,
    requiredLevel: StudentSkillLevel.ADVANCED,
    importanceWeight: 1.0,
  });

  // ----------------------------------------------------
  // Setup Institution Users and Profiles
  // ----------------------------------------------------
  const userInstA = await User.create({
    email: `instA-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    firstName: 'National',
    lastName: 'Institute',
    isVerified: true,
  });
  const instProfileA = await InstitutionProfile.create({
    userId: userInstA.id,
    institutionName: `NIT Test Inst A ${ts}`,
    institutionType: 'Engineering',
    location: 'Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    verified: true,
  });

  const userInstB = await User.create({
    email: `instB-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    firstName: 'State',
    lastName: 'University',
    isVerified: true,
  });
  const instProfileB = await InstitutionProfile.create({
    userId: userInstB.id,
    institutionName: `State Univ B ${ts}`,
    institutionType: 'University',
    location: 'Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    verified: true,
  });

  const departmentA = await InstitutionDepartment.create({
    institutionId: instProfileA.id,
    departmentName: 'Computer Science',
  });
  const departmentB = await InstitutionDepartment.create({
    institutionId: instProfileA.id,
    departmentName: 'Information Technology',
  });
  const departmentAInInstitutionB = await InstitutionDepartment.create({
    institutionId: instProfileB.id,
    departmentName: 'Computer Science',
  });

  // ----------------------------------------------------
  // Setup Student Users and Profiles
  // ----------------------------------------------------
  const userStudA = await User.create({
    email: `studA-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    firstName: 'Alice',
    lastName: 'Sharma',
    isVerified: true,
  });
  const studProfileA = await StudentProfile.create({
    userId: userStudA.id,
    headline: 'Aspiring Data Engineer',
    collegeName: instProfileA.institutionName,
    department: 'Computer Science',
    profileCompletion: 85,
  });

  const userStudB = await User.create({
    email: `studB-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    firstName: 'Bob',
    lastName: 'Verma',
    isVerified: true,
  });
  const studProfileB = await StudentProfile.create({
    userId: userStudB.id,
    headline: 'Web Developer',
    collegeName: instProfileB.institutionName,
    department: 'Information Technology',
    profileCompletion: 70,
  });

  // Empty Student (Edge case test)
  const userStudEmpty = await User.create({
    email: `studEmpty-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    firstName: 'Zero',
    lastName: 'Student',
    isVerified: true,
  });
  const studProfileEmpty = await StudentProfile.create({
    userId: userStudEmpty.id,
    collegeName: instProfileA.institutionName,
    profileCompletion: 10,
  });

  await studProfileA.update({
    institutionId: instProfileA.id,
    departmentId: departmentA.id,
  });
  await studProfileB.update({
    institutionId: instProfileB.id,
    departmentId: departmentAInInstitutionB.id,
    department: 'Computer Science',
  });
  await studProfileEmpty.update({
    institutionId: instProfileA.id,
    departmentId: departmentB.id,
    department: 'Information Technology',
  });

  await StudentInstitutionAffiliation.bulkCreate([
    {
      studentId: studProfileA.id,
      institutionId: instProfileA.id,
      departmentId: departmentA.id,
      enrollmentNumber: `A-${ts}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedByUserId: userInstA.id,
    },
    {
      studentId: studProfileB.id,
      institutionId: instProfileB.id,
      departmentId: departmentAInInstitutionB.id,
      enrollmentNumber: `B-${ts}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedByUserId: userInstB.id,
    },
    {
      studentId: studProfileEmpty.id,
      institutionId: instProfileA.id,
      departmentId: departmentB.id,
      enrollmentNumber: `EMPTY-${ts}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedByUserId: userInstA.id,
    },
  ]);

  const userAcademician = await User.create({
    email: `academician-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    firstName: 'Academic',
    lastName: 'Owner',
    isVerified: true,
  });
  await AcademicianProfile.create({
    userId: userAcademician.id,
    institutionId: instProfileA.id,
    departmentId: departmentA.id,
    department: 'Computer Science',
    designation: 'Professor',
  });

  const userUnaffiliatedAcademician = await User.create({
    email: `unaffiliated-academician-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    firstName: 'Unaffiliated',
    lastName: 'Academic',
    isVerified: true,
  });
  await AcademicianProfile.create({
    userId: userUnaffiliatedAcademician.id,
    department: 'Computer Science',
    designation: 'Professor',
  });

  // Student A Skills, Assessments, Gaps, Career Interest
  await StudentSkill.create({
    studentId: studProfileA.id,
    skillId: skillPython.id,
    level: StudentSkillLevel.ADVANCED,
    score: 85,
    verified: true,
  });
  await StudentSkill.create({
    studentId: studProfileA.id,
    skillId: skillSQL.id,
    level: StudentSkillLevel.INTERMEDIATE,
    score: 75,
    verified: false,
  });

  const assessPython = await SkillAssessment.create({
    skillId: skillPython.id,
    title: `Python Assessment ${ts}`,
    description: 'Test python proficiency',
    passingScore: 60,
    durationMinutes: 30,
    totalQuestions: 10,
    difficulty: 'ADVANCED',
  });
  await AssessmentAttempt.create({
    assessmentId: assessPython.id,
    studentId: studProfileA.id,
    startedAt: new Date(),
    completedAt: new Date(),
    score: 88,
    percentage: 88,
    status: AssessmentAttemptStatus.COMPLETED,
  });

  await SkillGap.create({
    studentId: studProfileA.id,
    skillId: skillReact.id,
    requiredLevel: StudentSkillLevel.INTERMEDIATE,
    requiredScore: 50,
    gapScore: 50,
    priority: SkillGapPriority.HIGH,
    status: SkillGapStatus.OPEN,
  });

  await StudentCareerInterest.create({
    studentId: studProfileA.id,
    careerRoleId: roleDataEngineer.id,
    priorityOrder: 1,
  });

  // ----------------------------------------------------
  // Setup Industry Users and Profiles
  // ----------------------------------------------------
  const userIndA = await User.create({
    email: `indA-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    firstName: 'TechCorp',
    lastName: 'HR',
    isVerified: true,
  });
  const indProfileA = await IndustryProfile.create({
    userId: userIndA.id,
    companyName: `TechCorp A ${ts}`,
    industryType: 'Software',
    location: 'Bangalore',
    city: 'Bangalore',
    verified: true,
  });

  const userIndB = await User.create({
    email: `indB-${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    firstName: 'InnoTech',
    lastName: 'Admin',
    isVerified: true,
  });
  const indProfileB = await IndustryProfile.create({
    userId: userIndB.id,
    companyName: `InnoTech B ${ts}`,
    industryType: 'Hardware',
    location: 'Delhi',
    city: 'Delhi',
    verified: true,
  });

  // Opportunities for Industry A
  const jobPython = await Job.create({
    industryId: indProfileA.id,
    title: `Senior Python Engineer ${ts}`,
    description: `Expert in Python-P15-${ts} and SQL-P15-${ts}`,
    requirements: `Required: Python-P15-${ts} and SQL-P15-${ts}`,
    workplaceType: WorkplaceType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    openings: 3,
    status: OpportunityStatus.OPEN,
  });

  const internData = await Internship.create({
    industryId: indProfileA.id,
    title: `Data Analyst Intern ${ts}`,
    description: `Requires SQL-P15-${ts} basics`,
    requirements: `Knowledge of SQL-P15-${ts}`,
    workplaceType: WorkplaceType.ON_SITE,
    openings: 2,
    status: OpportunityStatus.OPEN,
  });

  // Applications for Industry A's opportunities
  const app1 = await Application.create({
    studentId: studProfileA.id,
    opportunityId: jobPython.id,
    opportunityType: OpportunityType.JOB,
    status: ApplicationStatus.SHORTLISTED,
    appliedAt: new Date('2026-01-15T10:00:00Z'),
  });

  const app2 = await Application.create({
    studentId: studProfileB.id,
    opportunityId: jobPython.id,
    opportunityType: OpportunityType.JOB,
    status: ApplicationStatus.INTERVIEW,
    appliedAt: new Date('2026-02-10T10:00:00Z'),
  });

  const app3 = await Application.create({
    studentId: studProfileA.id,
    opportunityId: internData.id,
    opportunityType: OpportunityType.INTERNSHIP,
    status: ApplicationStatus.SELECTED,
    appliedAt: new Date('2026-02-15T10:00:00Z'),
  });

  // Placements and Placement Records for Institution A
  const placementA = await Placement.create({
    institutionId: instProfileA.id,
    academicYear: '2025-2026',
    totalStudents: 100,
    placedStudents: 85,
    higherStudiesStudents: 10,
    entrepreneurshipStudents: 3,
    averageSalary: 750000,
    highestSalary: 2400000,
    medianSalary: 650000,
  });

  const pRecord1 = await PlacementRecord.create({
    placementId: placementA.id,
    studentId: studProfileA.id,
    companyName: 'Google',
    packageOffered: 2400000,
    roleOffered: 'Software Engineer',
  });

  const pRecord2 = await PlacementRecord.create({
    placementId: placementA.id,
    studentId: studProfileB.id,
    companyName: 'Microsoft',
    packageOffered: 1800000,
    roleOffered: 'Data Engineer',
  });

  const collabA = await Collaboration.create({
    institutionId: instProfileA.id,
    industryId: indProfileA.id,
    title: `Industry Academia Bridge ${ts}`,
    description: 'Bridge workshop for industry and academia',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-05'),
    collaborationType: CollaborationType.WORKSHOP,
    status: CollaborationStatus.APPROVED,
  });

  const connA = await IndustryConnection.create({
    institutionId: instProfileA.id,
    industryId: indProfileA.id,
    connectionType: 'MOU',
    startDate: new Date('2026-01-01'),
    isActive: true,
  });

  console.log('\n--- 1. Testing Student Skill Analytics ---');

  await test('getStudentSkillAnalytics: computes correct metrics for student with skills and assessments', async () => {
    const analytics = await analyticsService.getStudentSkillAnalytics(studProfileA.id, {
      id: userStudA.id,
      role: UserRole.STUDENT,
    });

    assert.strictEqual(analytics.studentId, studProfileA.id);
    assert.strictEqual(analytics.totalSkills, 2);
    assert.strictEqual(analytics.verifiedSkills, 1);
    assert.strictEqual(analytics.skillLevels.ADVANCED, 1);
    assert.strictEqual(analytics.skillLevels.INTERMEDIATE, 1);
    assert.strictEqual(analytics.averageSkillScore, 80); // (85 + 75) / 2
    assert.strictEqual(analytics.assessmentPerformance.completedAttempts, 1);
    assert.strictEqual(analytics.assessmentPerformance.averageScore, 88);
    assert.strictEqual(analytics.skillGaps.totalActiveGaps, 1);
    assert.strictEqual(analytics.skillGaps.gapPriorities.HIGH, 1);
    assert.strictEqual(analytics.careerAlignment.targetRole?.title, roleDataEngineer.title);
    assert.strictEqual(analytics.careerAlignment.requiredSkillsCount, 2);
    assert.strictEqual(analytics.careerAlignment.matchedSkillsCount, 2);
    assert.strictEqual(analytics.careerAlignment.alignmentPercentage, 100);
  });

  await test('getStudentSkillAnalytics: handles student with zero skills/assessments/gaps cleanly', async () => {
    const analytics = await analyticsService.getStudentSkillAnalytics(studProfileEmpty.id, {
      id: userStudEmpty.id,
      role: UserRole.STUDENT,
    });

    assert.strictEqual(analytics.totalSkills, 0);
    assert.strictEqual(analytics.verifiedSkills, 0);
    assert.strictEqual(analytics.averageSkillScore, 0);
    assert.strictEqual(analytics.assessmentPerformance.completedAttempts, 0);
    assert.strictEqual(analytics.assessmentPerformance.averageScore, 0);
    assert.strictEqual(analytics.skillGaps.totalActiveGaps, 0);
    assert.strictEqual(analytics.careerAlignment.alignmentPercentage, 0);
  });

  await test('getStudentSkillAnalytics: IDOR protection blocks Student B from accessing Student A analytics', async () => {
    let errorCaught = false;
    try {
      await analyticsService.getStudentSkillAnalytics(studProfileA.id, {
        id: userStudB.id,
        role: UserRole.STUDENT,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.name === 'AuthorizationError' || err.message.includes('only access your own'));
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError when accessing another student analytics');
  });

  console.log('\n--- 2. Testing Institution Skill & Placement Analytics ---');

  await test('getInstitutionSkillAnalytics: aggregates students belonging to institution', async () => {
    const analytics = await analyticsService.getInstitutionSkillAnalytics(instProfileA.id, {
      id: userInstA.id,
      role: UserRole.INSTITUTION,
    });

    assert.strictEqual(analytics.institutionId, instProfileA.id);
    assert.strictEqual(analytics.institutionName, instProfileA.institutionName);
    assert.strictEqual(analytics.studentStats.totalStudents, 2); // studProfileA and studProfileEmpty
    assert.strictEqual(analytics.skillDistribution.totalStudentsWithSkills, 1);
    assert.strictEqual(analytics.skillDistribution.totalSkillsRecorded, 2);
    assert.strictEqual(analytics.assessmentPerformance.totalAssessmentsCompleted, 1);
    assert.strictEqual(analytics.assessmentPerformance.averageScore, 88);
  });

  await test('getInstitutionSkillAnalytics: IDOR protection blocks Institution B from accessing Institution A', async () => {
    let errorCaught = false;
    try {
      await analyticsService.getInstitutionSkillAnalytics(instProfileA.id, {
        id: userInstB.id,
        role: UserRole.INSTITUTION,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.name === 'AuthorizationError' || err.message.includes('only access your own'));
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError for cross-institution skill access');
  });

  await test('getPlacementAnalytics: computes placement statistics, trends, and company distribution', async () => {
    const placements = await analyticsService.getPlacementAnalytics(instProfileA.id, {
      id: userInstA.id,
      role: UserRole.INSTITUTION,
    });

    assert.strictEqual(placements.institutionId, instProfileA.id);
    assert.strictEqual(placements.totalStudents, 100);
    assert.strictEqual(placements.placedStudents, 85);
    assert.strictEqual(placements.placementRate, 85);
    assert.strictEqual(placements.totalPlacementRecords, 2);
    assert.strictEqual(placements.topCompanies.length, 2);
    assert.strictEqual(placements.topCompanies[0].companyName, 'Google');
    assert.strictEqual(placements.placementTrends.length, 1);
    assert.strictEqual(placements.placementTrends[0].academicYear, '2025-2026');
  });

  await test('getPlacementAnalytics: IDOR protection blocks Institution B from accessing Institution A placements', async () => {
    let errorCaught = false;
    try {
      await analyticsService.getPlacementAnalytics(instProfileA.id, {
        id: userInstB.id,
        role: UserRole.INSTITUTION,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.name === 'AuthorizationError');
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError for cross-institution placement access');
  });

  console.log('\n--- 3. Testing Industry Hiring Analytics ---');

  await test('getIndustryHiringAnalytics: computes active opportunities, application status funnel, and candidate skills', async () => {
    const hiring = await analyticsService.getIndustryHiringAnalytics(indProfileA.id, {
      id: userIndA.id,
      role: UserRole.INDUSTRY,
    });

    assert.strictEqual(hiring.industryId, indProfileA.id);
    assert.strictEqual(hiring.activeOpportunities, 2); // 1 Job + 1 Internship
    assert.strictEqual(hiring.totalApplications, 3);
    assert.strictEqual(hiring.shortlisted, 1);
    assert.strictEqual(hiring.interviewCount, 1);
    assert.strictEqual(hiring.selected, 1);
    assert.strictEqual(hiring.hiringFunnel.totalApplied, 3);
    assert.strictEqual(hiring.hiringFunnel.shortlisted, 1);
    assert.strictEqual(hiring.hiringFunnel.interviewScheduled, 1);
    assert.strictEqual(hiring.hiringFunnel.offeredOrAccepted, 1);
    assert.strictEqual(hiring.candidateStats.uniqueApplicants, 2); // studA and studB
    assert.ok(hiring.topCandidateSkills.length >= 2);
    assert.ok(hiring.applicationTrends.length >= 1);
  });

  await test('getIndustryHiringAnalytics: handles industry with zero opportunities cleanly', async () => {
    const hiring = await analyticsService.getIndustryHiringAnalytics(indProfileB.id, {
      id: userIndB.id,
      role: UserRole.INDUSTRY,
    });

    assert.strictEqual(hiring.activeOpportunities, 0);
    assert.strictEqual(hiring.totalApplications, 0);
    assert.strictEqual(hiring.candidateStats.uniqueApplicants, 0);
    assert.strictEqual(hiring.topCandidateSkills.length, 0);
    assert.strictEqual(hiring.applicationTrends.length, 0);
  });

  await test('getIndustryHiringAnalytics: IDOR protection blocks Industry B from accessing Industry A hiring', async () => {
    let errorCaught = false;
    try {
      await analyticsService.getIndustryHiringAnalytics(indProfileA.id, {
        id: userIndB.id,
        role: UserRole.INDUSTRY,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.name === 'AuthorizationError');
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError for cross-industry hiring access');
  });

  console.log('\n--- 4. Testing Application Analytics ---');

  await test('getApplicationAnalytics: student role gets own application metrics', async () => {
    const appMetrics: any = await analyticsService.getApplicationAnalytics({}, {
      id: userStudA.id,
      role: UserRole.STUDENT,
    });

    assert.strictEqual(appMetrics.totalApplications, 2);
    assert.strictEqual(appMetrics.statusCounts.SHORTLISTED, 1);
    assert.strictEqual(appMetrics.statusCounts.SELECTED, 1);
  });

  await test('getApplicationAnalytics: institution role gets applications from enrolled students', async () => {
    const appMetrics: any = await analyticsService.getApplicationAnalytics({}, {
      id: userInstA.id,
      role: UserRole.INSTITUTION,
    });

    assert.strictEqual(appMetrics.totalApplications, 2); // studProfileA belongs to instProfileA
  });

  console.log('\n--- 5. Testing Skill Demand Analytics ---');

  await test('getSkillDemandAnalytics: counts skill demands across opportunities deterministically', async () => {
    const demand = await analyticsService.getSkillDemandAnalytics({ limit: 10 });

    assert.ok(demand.totalAnalyzedOpportunities >= 2);
    assert.ok(demand.topDemandedSkills.length >= 1);
    const pythonDemand = demand.topDemandedSkills.find((s) => s.skillId === skillPython.id);
    assert.ok(pythonDemand !== undefined, 'Expected Python to be demanded in Senior Python Engineer job');
    assert.ok(pythonDemand.jobCount >= 1);
  });

  console.log('\n--- 6. Testing Role Dashboards ---');

  await test('getStudentDashboard: returns all authoritative Master Prompt fields', async () => {
    const dashboard = await analyticsService.getStudentDashboard(userStudA.id);

    assert.strictEqual(dashboard.profileCompletion, 85);
    assert.strictEqual(dashboard.skillSummary.totalSkills, 2);
    assert.strictEqual(dashboard.skillSummary.verifiedSkills, 1);
    assert.ok(Array.isArray(dashboard.topSkills));
    assert.ok(Array.isArray(dashboard.skillGaps));
    assert.ok(Array.isArray(dashboard.recommendedCareers));
    assert.ok(Array.isArray(dashboard.recommendedInternships));
    assert.ok(Array.isArray(dashboard.recommendedJobs));
    assert.ok(Array.isArray(dashboard.recentApplications));
    assert.ok(typeof dashboard.applicationStats === 'object');
    assert.ok(Array.isArray(dashboard.learningProgress));
    assert.ok(typeof dashboard.upcomingMentorship === 'object');
    assert.ok(typeof dashboard.notifications === 'object');
    assert.ok(typeof dashboard.portfolioStats === 'object');
  });

  await test('getIndustryDashboard: returns all authoritative Master Prompt fields', async () => {
    const dashboard = await analyticsService.getIndustryDashboard(userIndA.id);

    assert.strictEqual(dashboard.activeOpportunities, 2);
    assert.strictEqual(dashboard.applications, 3);
    assert.strictEqual(dashboard.shortlisted, 1);
    assert.strictEqual(dashboard.selected, 1);
    assert.strictEqual(dashboard.candidateStats.uniqueApplicants, 2);
    assert.ok(Array.isArray(dashboard.applicationTrends));
    assert.ok(typeof dashboard.hiringFunnel === 'object');
    assert.ok(Array.isArray(dashboard.topCandidateSkills));
  });

  await test('getInstitutionDashboard: returns all authoritative Master Prompt fields', async () => {
    const dashboard = await analyticsService.getInstitutionDashboard(userInstA.id);

    assert.strictEqual(dashboard.studentStats.totalStudents, 2);
    assert.strictEqual(dashboard.skillStats.totalStudentsWithSkills, 1);
    assert.strictEqual(dashboard.assessmentStats.totalAssessmentsCompleted, 1);
    assert.ok(typeof dashboard.internshipStats === 'object');
    assert.strictEqual(dashboard.placementStats.totalStudents, 100);
    assert.strictEqual(dashboard.placementStats.placedStudents, 85);
    assert.strictEqual(dashboard.industryStats.industryConnectionsCount, 1);
    assert.strictEqual(dashboard.collaborationStats.collaborationsCount, 1);
    assert.ok(Array.isArray(dashboard.skillDemand));
    assert.ok(Array.isArray(dashboard.placementTrends));
  });

  await test('Academician dashboard shows same-institution same-department students', async () => {
    const dashboard = await analyticsService.getAcademicianDashboard(userAcademician.id);
    const visibleStudentIds = dashboard.departmentStats.students.map((student: any) => student.id);

    assert.ok(visibleStudentIds.includes(studProfileA.id));
  });

  await test('Academician dashboard excludes same-department students from another institution', async () => {
    const dashboard = await analyticsService.getAcademicianDashboard(userAcademician.id);
    const visibleStudentIds = dashboard.departmentStats.students.map((student: any) => student.id);

    assert.strictEqual(visibleStudentIds.includes(studProfileB.id), false);
  });

  await test('Academician dashboard excludes students from another institution and department', async () => {
    const dashboard = await analyticsService.getAcademicianDashboard(userAcademician.id);
    const visibleStudentIds = dashboard.departmentStats.students.map((student: any) => student.id);

    assert.strictEqual(visibleStudentIds.includes(studProfileB.id), false);
  });

  await test('Academician dashboard excludes same-institution students from another department', async () => {
    const dashboard = await analyticsService.getAcademicianDashboard(userAcademician.id);
    const visibleStudentIds = dashboard.departmentStats.students.map((student: any) => student.id);

    assert.strictEqual(visibleStudentIds.includes(studProfileEmpty.id), false);
  });

  await test('Academician dashboard ignores legacy student institution and department text', async () => {
    await studProfileA.update({
      collegeName: 'Unrelated Institution',
      department: 'Unrelated Department',
      institutionId: instProfileB.id,
      departmentId: departmentAInInstitutionB.id,
    });

    const dashboard = await analyticsService.getAcademicianDashboard(userAcademician.id);
    const visibleStudentIds = dashboard.departmentStats.students.map((student: any) => student.id);

    assert.ok(visibleStudentIds.includes(studProfileA.id));
  });

  await test('Academician dashboard fails closed without a valid institution association', async () => {
    const dashboard = await analyticsService.getAcademicianDashboard(userUnaffiliatedAcademician.id);

    assert.strictEqual(dashboard.departmentStats.totalStudents, 0);
    assert.deepStrictEqual(dashboard.departmentStats.students, []);
  });

  console.log('\n--- 7. Testing Validation & Edge Cases ---');

  await test('dateRangeFilterSchema: rejects from date greater than to date', async () => {
    let errorCaught = false;
    try {
      dateRangeFilterSchema.parse({
        from: '2026-12-31',
        to: '2026-01-01',
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.name === 'ZodError');
    }
    assert.strictEqual(errorCaught, true, 'Expected ZodError when from > to');
  });

  await test('dateRangeFilterSchema: accepts valid from and to dates', async () => {
    const valid = dateRangeFilterSchema.parse({
      from: '2026-01-01',
      to: '2026-12-31',
    });
    assert.strictEqual(valid.from, '2026-01-01');
    assert.strictEqual(valid.to, '2026-12-31');
  });

  await test('Data Privacy: Password hashes and sensitive fields not present in analytics objects', async () => {
    const dashboard = await analyticsService.getStudentDashboard(userStudA.id);
    const jsonStr = JSON.stringify(dashboard);
    assert.strictEqual(jsonStr.includes('passwordHash'), false, 'Sensitive passwordHash must not be exposed');
    assert.strictEqual(jsonStr.includes('TestPass123!'), false, 'Raw passwords must not be exposed');
  });

  console.log('\n--- 8. Cleanup Test Entities ---');

  await test('Clean up all created test entities', async () => {
    await PlacementRecord.destroy({ where: { id: [pRecord1.id, pRecord2.id] } });
    await Placement.destroy({ where: { id: placementA.id } });
    await Collaboration.destroy({ where: { id: collabA.id } });
    await IndustryConnection.destroy({ where: { id: connA.id } });
    await Application.destroy({ where: { id: [app1.id, app2.id, app3.id] } });
    await Job.destroy({ where: { id: jobPython.id } });
    await Internship.destroy({ where: { id: internData.id } });
    await AssessmentAttempt.destroy({ where: { studentId: [studProfileA.id, studProfileB.id, studProfileEmpty.id] } });
    await SkillAssessment.destroy({ where: { id: assessPython.id } });
    await SkillGap.destroy({ where: { studentId: [studProfileA.id, studProfileB.id, studProfileEmpty.id] } });
    await StudentCareerInterest.destroy({ where: { studentId: [studProfileA.id, studProfileB.id, studProfileEmpty.id] } });
    await StudentSkill.destroy({ where: { studentId: [studProfileA.id, studProfileB.id, studProfileEmpty.id] } });
    await StudentInstitutionAffiliation.destroy({ where: { studentId: [studProfileA.id, studProfileB.id, studProfileEmpty.id] } });
    await StudentProfile.destroy({ where: { id: [studProfileA.id, studProfileB.id, studProfileEmpty.id] } });
    await AcademicianProfile.destroy({ where: { userId: [userAcademician.id, userUnaffiliatedAcademician.id] } });
    await InstitutionDepartment.destroy({ where: { id: [departmentA.id, departmentB.id, departmentAInInstitutionB.id] } });
    await IndustryProfile.destroy({ where: { id: [indProfileA.id, indProfileB.id] } });
    await InstitutionProfile.destroy({ where: { id: [instProfileA.id, instProfileB.id] } });
    await User.destroy({
      where: {
        id: [userStudA.id, userStudB.id, userStudEmpty.id, userIndA.id, userIndB.id, userInstA.id, userInstB.id, userAcademician.id, userUnaffiliatedAcademician.id],
      },
    });
    await CareerRoleSkill.destroy({ where: { careerRoleId: roleDataEngineer.id } });
    await CareerRole.destroy({ where: { id: roleDataEngineer.id } });
    await Skill.destroy({ where: { id: [skillPython.id, skillSQL.id, skillReact.id] } });
  });

  console.log('\n================================================================');
  console.log(`PHASE 15 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`Phase 15 Tests Failed: ${failed} tests failed`);
  }
};

if (require.main === module) {
  runPhase15Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
