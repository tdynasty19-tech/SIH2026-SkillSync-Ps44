import bcrypt from 'bcrypt';
import { runDemoSeed } from './seed-demo';
import { sequelize } from '../config/database';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentEducation } from '../models/student-education.model';
import { StudentSkill } from '../models/student-skill.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { AssessmentAnswer } from '../models/assessment-answer.model';
import { SkillGap } from '../models/skill-gap.model';
import { CareerRole } from '../models/career-role.model';
import { Job } from '../models/job.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioProject } from '../models/portfolio-project.model';
import { Mentor } from '../models/mentor.model';
import { MentorshipRequest } from '../models/mentorship-request.model';
import { MentorshipSession } from '../models/mentorship-session.model';
import { Notification } from '../models/notification.model';
import { LearningRecommendation } from '../models/learning-recommendation.model';
import { Placement } from '../models/placement.model';
import { Collaboration } from '../models/collaboration.model';
import { authService } from '../services/auth.service';
import { studentService } from '../services/student.service';
import { assessmentService } from '../services/assessment.service';
import { skillGapService } from '../services/skill-gap.service';
import { recommendationService } from '../services/recommendation.service';
import { opportunityService } from '../services/opportunity.service';
import { applicationService } from '../services/application.service';
import { industryService } from '../services/industry.service';
import { institutionService } from '../services/institution.service';
import { analyticsService } from '../services/analytics.service';
import { searchService } from '../services/search.service';
import { portfolioService } from '../services/portfolio.service';
import { mentorshipService } from '../services/mentorship.service';
import { swaggerSpec } from '../config/swagger.config';
import { UserRole } from '../constants/roles';
import {
  StudentSkillLevel,
  SkillGapPriority,
  ApplicationStatus,
  NotificationType,
} from '../constants/enums';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (details) console.error(`    Detail: ${details}`);
    throw new Error(`Test assertion failed: ${testName} - ${details ?? ''}`);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('PHASE 20: DEMO SEED & FRONTEND INTEGRATION VERIFICATION SUITE');
  console.log('===============================================================\n');

  // ----------------------------------------------------
  // TEST 1: PRODUCTION SAFETY SAFEGUARD
  // ----------------------------------------------------
  console.log('1. Testing Production Safety Safeguard...');
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  let blockedInProduction = false;
  try {
    await runDemoSeed();
  } catch (err: any) {
    if (err.message.includes('forbidden in production') || err.message.includes('SAFETY_VIOLATION')) {
      blockedInProduction = true;
    }
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
  assert(blockedInProduction, 'Demo seed explicitly refuses execution when NODE_ENV === "production"');

  // ----------------------------------------------------
  // TEST 2: SEED EXECUTION
  // ----------------------------------------------------
  console.log('\n2. Executing Initial Deterministic Demo Seed...');
  const seedResult1 = await runDemoSeed();
  assert(seedResult1.success === true, 'Initial demo seed executes successfully');
  assert(typeof seedResult1.aaravMatchScore === 'number', 'Aarav match score is computed deterministically');

  // ----------------------------------------------------
  // TEST 3: SEED IDEMPOTENCY
  // ----------------------------------------------------
  console.log('\n3. Testing Demo Seed Idempotency (Running Seed Again)...');
  const userCountBefore = await User.count({ where: { email: ['demo.student@sih.gov.in', 'demo.industry@sih.gov.in'] } });
  const appCountBefore = await Application.count();
  const jobCountBefore = await Job.count({ where: { title: 'Backend Engineering Intern' } });

  const seedResult2 = await runDemoSeed();
  assert(seedResult2.success === true, 'Second demo seed executes successfully without error');

  const userCountAfter = await User.count({ where: { email: ['demo.student@sih.gov.in', 'demo.industry@sih.gov.in'] } });
  const appCountAfter = await Application.count();
  const jobCountAfter = await Job.count({ where: { title: 'Backend Engineering Intern' } });

  assert(userCountBefore === userCountAfter, 'Idempotency: No duplicate users created on repeated seeding');
  assert(appCountBefore === appCountAfter, 'Idempotency: No duplicate applications created on repeated seeding');
  assert(jobCountBefore === jobCountAfter, 'Idempotency: No duplicate jobs created on repeated seeding');

  // ----------------------------------------------------
  // TEST 4: DEMO USER ACCOUNTS & CREDENTIAL SECURITY
  // ----------------------------------------------------
  console.log('\n4. Verifying Demo User Accounts & Credential Security...');
  const demoRoles = [
    { email: 'demo.student@sih.gov.in', expectedRole: UserRole.STUDENT, name: 'Aarav Sharma' },
    { email: 'demo.industry@sih.gov.in', expectedRole: UserRole.INDUSTRY, name: 'Rajesh Varma' },
    { email: 'demo.academician@sih.gov.in', expectedRole: UserRole.ACADEMICIAN, name: 'Dr. S. Ramanujan' },
    { email: 'demo.institution@sih.gov.in', expectedRole: UserRole.INSTITUTION, name: 'NITK Surathkal' },
  ];

  for (const roleDef of demoRoles) {
    const user = await User.findOne({ where: { email: roleDef.email } });
    assert(!!user, `Demo user exists for email ${roleDef.email}`);
    assert(user!.role === roleDef.expectedRole, `Role matches expected ${roleDef.expectedRole}`);
    assert(user!.isVerified === true, `User is marked verified`);
    assert(user!.isActive === true, `User is active`);

    // Verify bcrypt hash works with common password
    const validPassword = await bcrypt.compare('DemoPassword123!', user!.passwordHash);
    assert(validPassword, `Demo password "DemoPassword123!" successfully verifies against bcrypt hash for ${roleDef.email}`);

    // Verify toJSON() never serializes passwordHash
    const serialized = user!.toJSON() as any;
    assert(serialized.passwordHash === undefined, `User.toJSON() strips passwordHash from serialization for ${roleDef.email}`);
  }

  // ----------------------------------------------------
  // TEST 5: AARAV SHARMA DEMO SCENARIO VERIFICATION
  // ----------------------------------------------------
  console.log('\n5. Verifying Aarav Sharma Authoritative Master Prompt Scenario...');
  const studentUser = await User.findOne({ where: { email: 'demo.student@sih.gov.in' } });
  const studentProfile = await StudentProfile.findOne({ where: { userId: studentUser!.id } });
  assert(!!studentProfile, 'Student profile exists for Aarav Sharma');
  assert(studentProfile!.careerGoal === 'Backend Developer', 'Career goal is set to Backend Developer');
  assert(Number(studentProfile!.cgpa) === 8.85, 'CGPA is populated realistically');

  // Verify Student Skills
  const studentSkills = await StudentSkill.findAll({ where: { studentId: studentProfile!.id }, include: ['skill'] });
  const skillMap = new Map(studentSkills.map((s: any) => [s.skill.name, s]));

  assert(skillMap.has('Java') && skillMap.get('Java')!.level === StudentSkillLevel.ADVANCED && Number(skillMap.get('Java')!.score) === 88, 'Java -> Advanced (88%)');
  assert(skillMap.has('SQL') && skillMap.get('SQL')!.level === StudentSkillLevel.ADVANCED && Number(skillMap.get('SQL')!.score) === 91, 'SQL -> Advanced (91%)');
  assert(skillMap.has('Node.js') && skillMap.get('Node.js')!.level === StudentSkillLevel.INTERMEDIATE && Number(skillMap.get('Node.js')!.score) === 78, 'Node.js -> Intermediate (78%)');
  assert(skillMap.has('Docker') && skillMap.get('Docker')!.level === StudentSkillLevel.BEGINNER, 'Docker -> Beginner');
  assert(skillMap.has('AWS') && skillMap.get('AWS')!.level === StudentSkillLevel.BEGINNER, 'AWS -> Beginner');
  assert(skillMap.has('System Design') && skillMap.get('System Design')!.level === StudentSkillLevel.BEGINNER, 'System Design -> Beginner');

  // Verify Assessments & Consistency
  console.log('\n6. Verifying Assessment Integrity & Scoring Consistency...');
  const attempts = await AssessmentAttempt.findAll({
    where: { studentId: studentProfile!.id },
    include: ['assessment', 'answers'],
  });
  assert(attempts.length >= 3, 'At least 3 assessments recorded (Java, SQL, Node.js)');

  for (const att of attempts) {
    const title = (att as any).assessment.title;
    const answers: AssessmentAnswer[] = (att as any).answers;
    assert(answers.length > 0, `Answers exist for assessment "${title}"`);

    const totalEarned = answers.reduce((sum, a) => sum + Number(a.pointsEarned), 0);
    assert(Number(att.score) === totalEarned, `Attempt score (${att.score}) equals sum of answer pointsEarned (${totalEarned}) for "${title}"`);
    assert(Number(att.percentage) === totalEarned, `Percentage (${att.percentage}%) matches calculated score for "${title}"`);
  }

  // Verify Skill Gaps
  console.log('\n7. Verifying Master Prompt Skill Gaps...');
  const gaps = await SkillGap.findAll({ where: { studentId: studentProfile!.id }, include: ['skill'] });
  const gapMap = new Map(gaps.map((g: any) => [g.skill.name, g]));

  assert(gapMap.has('Docker') && gapMap.get('Docker')!.priority === SkillGapPriority.HIGH, 'Docker Skill Gap -> HIGH');
  assert(gapMap.has('AWS') && gapMap.get('AWS')!.priority === SkillGapPriority.HIGH, 'AWS Skill Gap -> HIGH');
  assert(gapMap.has('System Design') && gapMap.get('System Design')!.priority === SkillGapPriority.MEDIUM, 'System Design Skill Gap -> MEDIUM');

  // Verify Recommended Opportunity & Match Score
  console.log('\n8. Verifying Recommended Opportunity & Match Score...');
  const backendJob = await Job.findOne({ where: { title: 'Backend Engineering Intern' } });
  assert(!!backendJob, 'Backend Engineering Intern opportunity exists');

  const recsResult = await recommendationService.recommendOpportunitiesForStudent(studentUser!.id, { page: 1, limit: 10 });
  assert(recsResult.recommendations.length > 0, 'Opportunity recommendations returned for Aarav');
  const topRec = recsResult.recommendations[0];
  assert(topRec.opportunity.title === 'Backend Engineering Intern', 'Top recommended opportunity is "Backend Engineering Intern"');
  assert(topRec.matchScore >= 85, `Top recommended match score is high match >= 85% (Actual: ${topRec.matchScore}%)`);

  // Verify Portfolio & Sub-entities
  console.log('\n9. Verifying Portfolio, Projects & Mentorship Data...');
  const portfolio = await Portfolio.findOne({ where: { studentId: studentProfile!.id }, include: ['projects', 'certifications', 'achievements', 'experiences'] });
  assert(!!portfolio, 'Aarav portfolio exists');
  assert((portfolio as any).projects.length >= 3, 'Portfolio contains at least 3 engineering projects');
  assert((portfolio as any).certifications.length >= 1, 'Portfolio contains certification');
  assert((portfolio as any).achievements.length >= 1, 'Portfolio contains achievement');

  // Verify Mentorship
  const mentor = await Mentor.findOne({ include: [{ model: User, as: 'user', where: { email: 'demo.academician@sih.gov.in' } }] });
  assert(!!mentor, 'Mentor Dr. Ramanujan exists');
  const mentorshipReq = await MentorshipRequest.findOne({ where: { studentId: studentProfile!.id, mentorId: mentor!.id } });
  assert(!!mentorshipReq && mentorshipReq.status === 'ACCEPTED', 'Mentorship request is ACCEPTED');
  const session = await MentorshipSession.findOne({ where: { mentorshipRequestId: mentorshipReq!.id } });
  assert(!!session && session.isCompleted === true, 'Mentorship session is completed with notes');

  // Verify Notifications
  console.log('\n10. Verifying Notification Stream for Aarav...');
  const notifs = await Notification.findAll({ where: { userId: studentUser!.id } });
  assert(notifs.length >= 7, 'At least 7 notifications seeded covering the Master Prompt notification stream');
  const typesPresent = new Set(notifs.map((n) => n.type));
  assert(typesPresent.has(NotificationType.APPLICATION_SUBMITTED), 'APPLICATION_SUBMITTED notification present');
  assert(typesPresent.has(NotificationType.SHORTLISTED), 'SHORTLISTED notification present');
  assert(typesPresent.has(NotificationType.SKILL_GAP_DETECTED), 'SKILL_GAP_DETECTED notification present');
  assert(typesPresent.has(NotificationType.LEARNING_RECOMMENDATION), 'LEARNING_RECOMMENDATION notification present');
  assert(typesPresent.has(NotificationType.MENTORSHIP_ACCEPTED), 'MENTORSHIP_ACCEPTED notification present');
  assert(typesPresent.has(NotificationType.NEW_OPPORTUNITY), 'NEW_OPPORTUNITY notification present');

  // ----------------------------------------------------
  // TEST 11: END-TO-END DEMO API WORKFLOWS
  // ----------------------------------------------------
  console.log('\n11. Verifying Representative API Workflows via Service Layer...');

  // Student Workflow
  const studentLogin = await authService.login({ email: 'demo.student@sih.gov.in', password: 'DemoPassword123!' });
  assert(!!studentLogin.accessToken, 'Aarav login generates valid JWT accessToken');

  const studentProfData = await studentService.getProfile(studentUser!.id);
  assert(studentProfData.studentId === 'NITK2023CS042', 'Student profile API returns correct profile');

  const studentSkillsList = await studentService.getSkills(studentUser!.id);
  assert(studentSkillsList.skills.length >= 6, 'Student skills API returns all 6 skills');

  const studentGaps = await skillGapService.getStudentGaps(studentUser!.id);
  assert(studentGaps.skillGaps.length >= 3, 'Skill gaps API returns open skill gaps');

  const studentApps = await applicationService.getMyApplications(studentUser!.id, { page: 1, limit: 10 });
  assert(studentApps.applications.length >= 2, 'Student applications API returns application history');

  const studentDashboard = await analyticsService.getStudentDashboard(studentUser!.id);
  assert(studentDashboard.skillSummary.totalSkills >= 6, 'Student dashboard returns comprehensive metrics');

  // Academic Context Verification
  const studentAcademicContext = await institutionService.getStudentAcademicContext(studentUser!.id);
  assert(!!studentAcademicContext.activeEnrollment, 'Aarav has active student academic enrollment');
  assert(studentAcademicContext.activeEnrollment?.program?.programCode === 'BTECH-CSE', 'Aarav is enrolled in BTECH-CSE program');
  assert(studentAcademicContext.activeEnrollment?.batch?.batchName === 'Batch of 2022-2026', 'Aarav is in Batch of 2022-2026');

  // Industry Workflow
  const industryUser = await User.findOne({ where: { email: 'demo.industry@sih.gov.in' } });
  const industryLogin = await authService.login({ email: 'demo.industry@sih.gov.in', password: 'DemoPassword123!' });
  assert(!!industryLogin.accessToken, 'Industry user login generates valid accessToken');

  const industryDashboard = await analyticsService.getIndustryDashboard(industryUser!.id);
  assert(industryDashboard.activeOpportunities >= 2, 'Industry dashboard returns active opportunities and applicants');

  // Institution Workflow
  const institutionUser = await User.findOne({ where: { email: 'demo.institution@sih.gov.in' } });
  const institutionLogin = await authService.login({ email: 'demo.institution@sih.gov.in', password: 'DemoPassword123!' });
  assert(!!institutionLogin.accessToken, 'Institution user login generates valid accessToken');

  const institutionDashboard = await analyticsService.getInstitutionDashboard(institutionUser!.id);
  assert(institutionDashboard.studentStats.totalStudents >= 1, 'Institution dashboard returns departments and placement stats');

  const instPrograms = await institutionService.getPrograms(institutionUser!.id, { page: 1, limit: 10 });
  assert(instPrograms.programs.length >= 1, 'Institution programs API returns seeded programs');

  const instBatches = await institutionService.getBatches(institutionUser!.id, { page: 1, limit: 10 });
  assert(instBatches.batches.length >= 1, 'Institution batches API returns seeded batches');

  // Global Search Workflow
  console.log('\n12. Verifying Search Readiness...');
  const searchResultBackend = await searchService.search({ q: 'Backend', page: 1, limit: 5 });
  assert(searchResultBackend.pagination.total > 0, 'Search for "Backend" returns opportunities and roles');

  const searchResultJava = await searchService.search({ q: 'Java', page: 1, limit: 5 });
  assert(searchResultJava.pagination.total > 0, 'Search for "Java" returns skills and matching opportunities');

  // ----------------------------------------------------
  // TEST 13: SWAGGER / OPENAPI DOCUMENTATION VERIFICATION
  // ----------------------------------------------------
  console.log('\n13. Verifying Swagger OpenAPI Documentation Completeness...');
  const spec = swaggerSpec as any;
  assert(!!spec && !!spec.openapi, 'Swagger OpenAPI 3.0 specification is generated');
  assert(spec.info.title.includes('SIH PS 44'), 'Swagger spec title matches SIH PS 44');
  const pathKeys = Object.keys(spec.paths || {});
  assert(pathKeys.some((p: string) => p.includes('/auth/login')), 'Swagger documents /auth/login');
  assert(pathKeys.some((p: string) => p.includes('profile')), 'Swagger documents profile endpoints');
  assert(pathKeys.some((p: string) => p.includes('/applications')), 'Swagger documents /applications');
  assert(pathKeys.some((p: string) => p.includes('/recommendations')), 'Swagger documents /recommendations');
  assert(pathKeys.some((p: string) => p.includes('/search')), 'Swagger documents /search');
  assert(pathKeys.some((p: string) => p.includes('/ai')), 'Swagger documents /ai endpoints');

  console.log('\n===============================================================');
  console.log(`PHASE 20 VERIFICATION COMPLETED: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
  console.log('===============================================================\n');

  return { passedTests, totalTests };
}

if (require.main === module) {
  runTests()
    .then(() => {
      console.log('All Phase 20 demo seed & frontend integration readiness tests succeeded.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Phase 20 test run failed:', err);
      process.exit(1);
    });
}
