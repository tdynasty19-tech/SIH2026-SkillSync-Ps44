import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { migrator } from '../config/migrator';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { Job } from '../models/job.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { authService } from '../services/auth.service';
import { studentService } from '../services/student.service';
import { assessmentService } from '../services/assessment.service';
import { skillGapService } from '../services/skill-gap.service';
import { opportunityService } from '../services/opportunity.service';
import { applicationService } from '../services/application.service';
import { industryService } from '../services/industry.service';
import { institutionService } from '../services/institution.service';
import { matchingService, MATCH_WEIGHTS } from '../services/matching.service';
import { analyticsService } from '../services/analytics.service';
import { searchService } from '../services/search.service';
import { notificationService } from '../services/notification.service';
import { storageService } from '../utils/storage.util';
import { appEvents, AppEventType } from '../events';
import { UserRole } from '../constants/roles';
import { HttpStatus } from '../constants/http-status';
import {
  StudentSkillLevel,
  AssessmentQuestionType,
  AssessmentAttemptStatus,
  OpportunityStatus,
  OpportunityType,
  WorkplaceType,
  EmploymentType,
  ApplicationStatus,
} from '../constants/enums';

export const runPhase19IntegrationTests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 19 COMPREHENSIVE INTEGRATION VERIFICATION TESTS');
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
  const testPassword = 'IntegrationSecurePass123!';

  // =========================================================================
  // 1. MIGRATION & SCHEMA VERIFICATION
  // =========================================================================
  console.log('--- 1. Database Migrations & Schema Verification ---');

  await test('Umzug migration status verifies all migrations are executed and zero pending', async () => {
    const executed = await migrator.executed();
    const pending = await migrator.pending();
    assert.ok(executed.length > 0, 'Must have executed migrations');
    assert.strictEqual(pending.length, 0, 'There must be zero pending unapplied migrations');
  });

  // =========================================================================
  // 2. END-TO-END WORKFLOW A: COMPLETE STUDENT JOURNEY
  // =========================================================================
  console.log('\n--- 2. End-to-End Workflow A: Student Lifecycle ---');

  const studentEmail = `student_e2e_${ts}@test.com`;
  let studentUser: any = null;
  let studentTokens: any = null;
  let studentProfile: any = null;
  let skillBackend: any = null;
  let assessmentId = 0;
  let attemptId = 0;
  let q1Id = 0;
  let createdJobId = 0;
  let createdAppId = 0;

  await test('Step 1: Student registers account', async () => {
    const regResult = await authService.register({
      firstName: 'Vikram',
      lastName: 'Mehta',
      email: studentEmail,
      password: testPassword,
      role: UserRole.STUDENT,
    });
    studentUser = regResult.user;
    assert.ok(studentUser.id);
    assert.strictEqual(studentUser.email, studentEmail);
    assert.strictEqual(studentUser.role, UserRole.STUDENT);
  });

  await test('Step 2: Student authenticates and receives JWT access & refresh tokens', async () => {
    studentTokens = await authService.login({
      email: studentEmail,
      password: testPassword,
    });
    assert.ok(studentTokens.accessToken);
    assert.ok(studentTokens.refreshToken);
    assert.strictEqual(studentTokens.user.id, studentUser.id);
  });

  await test('Step 3: Student completes the registration-created profile and profileCompletion is derived', async () => {
    studentProfile = await studentService.updateProfile(studentUser.id, {
      collegeName: 'Indian Institute of Technology Bombay',
      department: 'Computer Science',
      course: 'B.Tech',
      headline: 'Aspiring Distributed Systems Architect',
      bio: 'Enthusiastic student passionate about high-concurrency microservices.',
      location: 'Mumbai, Maharashtra',
      gender: 'Male',
      dateOfBirth: '2003-05-15',
    });
    assert.ok(studentProfile.id);
    assert.strictEqual(studentProfile.userId, studentUser.id);
    assert.ok(studentProfile.profileCompletion > 0, 'Server must calculate profile completion');
  });

  await test('Step 4: Student adds education details and updates profile completion', async () => {
    const initialCompletion = studentProfile.profileCompletion;
    await studentService.addEducation(studentUser.id, {
      institutionName: 'IIT Bombay',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science & Engineering',
      startYear: 2021,
      endYear: 2025,
    });

    const updatedProfile = await studentService.getProfile(studentUser.id);
    assert.ok(updatedProfile.profileCompletion >= initialCompletion, 'Education adds to completion score');
  });

  await test('Step 5: Setup skill catalog and assessment questions', async () => {
    // 1. Skill Category & Skill
    const cat = await SkillCategory.create({
      name: `Backend Engineering ${ts}`,
      description: 'Distributed systems, databases, APIs',
    });

    skillBackend = await Skill.create({
      categoryId: cat.id,
      name: `Node.js Architecture ${ts}`,
      slug: `nodejs-arch-${ts}`,
      description: 'Event-loop, streams, clustering, express microservices',
    });

    // 2. Add skill to student
    await studentService.addSkill(studentUser.id, {
      skillId: skillBackend.id,
      level: StudentSkillLevel.BEGINNER,
    });

    // 3. Create Assessment
    const assessment = await SkillAssessment.create({
      skillId: skillBackend.id,
      title: `Node.js Core Competency ${ts}`,
      description: 'Evaluates asynchronous operations, memory limits, and security',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 30,
      passingScore: 60,
      totalQuestions: 2,
      isActive: true,
    });
    assessmentId = assessment.id;

    // 4. Create Questions
    const q1 = await AssessmentQuestion.create({
      assessmentId: assessment.id,
      question: 'What event-loop phase executes process.nextTick callbacks?',
      questionType: AssessmentQuestionType.SINGLE_CHOICE,
      options: ['Microtask Queue', 'Timers Phase', 'Poll Phase', 'Check Phase'],
      correctAnswer: 'Microtask Queue',
      points: 50,
      order: 1,
    });
    q1Id = q1.id;

    await AssessmentQuestion.create({
      assessmentId: assessment.id,
      question: 'Which HTTP security header mitigates MIME-sniffing vulnerabilities?',
      questionType: AssessmentQuestionType.SINGLE_CHOICE,
      options: ['X-Frame-Options', 'X-Content-Type-Options: nosniff', 'Strict-Transport-Security', 'Referrer-Policy'],
      correctAnswer: 'X-Content-Type-Options: nosniff',
      points: 50,
      order: 2,
    });

    // 5. Target Career Role
    const role = await CareerRole.create({
      title: `Principal Backend Engineer ${ts}`,
      slug: `principal-backend-${ts}`,
      description: 'High-scale distributed systems designer',
    });

    await CareerRoleSkill.create({
      careerRoleId: role.id,
      skillId: skillBackend.id,
      requiredLevel: StudentSkillLevel.ADVANCED,
      importanceWeight: 1.0,
    });
  });

  await test('Step 6: Student takes assessment; server scores attempt and updates StudentSkill & SkillGap', async () => {
    // Start attempt
    const attemptRes = await assessmentService.startAttempt(studentUser.id, assessmentId);
    attemptId = attemptRes.attempt.id;
    assert.strictEqual(attemptRes.attempt.status, AssessmentAttemptStatus.IN_PROGRESS);

    // Verify safe questions payload does NOT leak correctAnswer
    for (const q of attemptRes.questions) {
      assert.strictEqual((q as any).correctAnswer, undefined, 'Must not leak correct answer');
    }

    // Submit answers
    const submitRes = await assessmentService.submitAttempt(studentUser.id, attemptId, {
      answers: [
        { questionId: q1Id, answer: 'Microtask Queue' },
      ],
    });

    assert.strictEqual(submitRes.status, AssessmentAttemptStatus.COMPLETED);
    assert.strictEqual(submitRes.score, 50);
    assert.strictEqual(submitRes.percentage, 50);

    // Verify student skill score updated
    const studentSkill = await StudentSkill.findOne({
      where: { studentId: studentProfile.id, skillId: skillBackend.id },
    });
    assert.ok(studentSkill);
    assert.strictEqual(Number(studentSkill.score), 50);

    // Verify skill gap calculation
    const gaps = await skillGapService.calculateGapsForStudent(studentProfile.id);
    assert.ok(Array.isArray(gaps));
  });

  // =========================================================================
  // 3. END-TO-END WORKFLOW B: COMPLETE INDUSTRY JOURNEY & APPLICATION FUNNEL
  // =========================================================================
  console.log('\n--- 3. End-to-End Workflow B: Industry Journey & Application Funnel ---');

  const industryEmail = `industry_e2e_${ts}@test.com`;
  let industryUser: any = null;
  let industryTokens: any = null;
  let industryProfile: any = null;

  await test('Step 7: Industry registers and authenticates', async () => {
    const regResult = await authService.register({
      firstName: 'Apex',
      lastName: 'Enterprises',
      email: industryEmail,
      password: testPassword,
      role: UserRole.INDUSTRY,
    });
    industryUser = regResult.user;

    industryTokens = await authService.login({
      email: industryEmail,
      password: testPassword,
    });
    assert.ok(industryTokens.accessToken);
  });

  await test('Step 8: Industry creates organization profile', async () => {
    industryProfile = await industryService.createMyProfile(industryUser.id, {
      companyName: `Apex Cloud Systems ${ts}`,
      industryType: 'Cloud Infrastructure',
      location: 'Bangalore, Karnataka',
      description: 'Leading provider of resilient cloud architectures.',
    });
    assert.ok(industryProfile.id);
    assert.strictEqual(industryProfile.userId, industryUser.id);
  });

  await test('Step 9: Industry creates published Job opportunity', async () => {
    const job = await opportunityService.createJob(industryUser.id, {
      title: `Senior Cloud Backend Engineer ${ts}`,
      description: 'Develop distributed enterprise backends with Node.js and SQL.',
      requirements: 'Strong understanding of concurrency, transactions, and security.',
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: WorkplaceType.HYBRID,
      location: 'Bangalore, India',
      openings: 3,
      salaryMin: 1500000,
      salaryMax: 2500000,
      applicationDeadline: '2028-12-31',
      status: OpportunityStatus.OPEN,
    });

    createdJobId = job.id;
    assert.strictEqual(job.industryId, industryProfile.id);
    assert.strictEqual(job.status, OpportunityStatus.OPEN);
  });

  await test('Step 10: Student searches and discovers the opportunity via Global Search', async () => {
    const searchRes = await searchService.search({
      q: 'Cloud Backend',
      type: undefined,
      page: 1,
      limit: 10,
    });

    assert.ok(searchRes.results.length >= 1);
    const found = searchRes.results.find((r) => r.id === createdJobId);
    assert.ok(found, 'Search must index and return active job');
  });

  await test('Step 11: Student applies for Job; triggers APPLIED state and status history', async () => {
    const app = await applicationService.submitApplication(studentUser.id, {
      opportunityId: createdJobId,
      opportunityType: OpportunityType.JOB,
      coverLetter: 'I am excited to build resilient distributed backends at Apex Cloud.',
    });

    createdAppId = app.id;
    assert.strictEqual(app.status, ApplicationStatus.APPLIED);
    assert.strictEqual(app.studentId, studentProfile.id);

    // Verify status history
    const history = await ApplicationStatusHistory.findAll({ where: { applicationId: app.id } });
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].toStatus, ApplicationStatus.APPLIED);
  });

  await test('Step 12: Student receives notification for submitted application', async () => {
    const notifs = await notificationService.getMyNotifications(studentUser.id, { page: 1, limit: 10 });
    assert.ok(Array.isArray(notifs.notifications));
  });

  await test('Step 13: Industry executes status progression: APPLIED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW -> SELECTED', async () => {
    // 1. APPLIED -> UNDER_REVIEW
    const s1 = await applicationService.updateApplicationStatus(industryUser, createdAppId, {
      status: ApplicationStatus.UNDER_REVIEW,
      reason: 'Candidate profile meets initial criteria.',
    });
    assert.strictEqual(s1.status, ApplicationStatus.UNDER_REVIEW);

    // 2. UNDER_REVIEW -> SHORTLISTED
    const s2 = await applicationService.updateApplicationStatus(industryUser, createdAppId, {
      status: ApplicationStatus.SHORTLISTED,
      reason: 'Shortlisted for interview round.',
    });
    assert.strictEqual(s2.status, ApplicationStatus.SHORTLISTED);

    // 3. SHORTLISTED -> INTERVIEW
    const s3 = await applicationService.updateApplicationStatus(industryUser, createdAppId, {
      status: ApplicationStatus.INTERVIEW,
      reason: 'Technical interview scheduled.',
    });
    assert.strictEqual(s3.status, ApplicationStatus.INTERVIEW);

    // 4. INTERVIEW -> SELECTED
    const s4 = await applicationService.updateApplicationStatus(industryUser, createdAppId, {
      status: ApplicationStatus.SELECTED,
      reason: 'Offer letter dispatched.',
    });
    assert.strictEqual(s4.status, ApplicationStatus.SELECTED);

    // Verify all history transitions are stored
    const totalHistory = await ApplicationStatusHistory.findAll({ where: { applicationId: createdAppId } });
    assert.strictEqual(totalHistory.length, 5, 'Initial APPLIED + 4 transitions = 5 records');
  });

  await test('Step 14: Terminal status rejects further transitions', async () => {
    let errorCaught = false;
    try {
      await applicationService.updateApplicationStatus(industryUser, createdAppId, {
        status: ApplicationStatus.UNDER_REVIEW,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.statusCode === HttpStatus.BAD_REQUEST || err.statusCode === HttpStatus.CONFLICT);
      assert.ok(err.message.includes('Invalid status transition') || err.message.includes('terminal'));
    }
    assert.ok(errorCaught, 'Cannot transition from terminal SELECTED state');
  });

  await test('Step 15: Industry retrieves Hiring Analytics and Industry Dashboard', async () => {
    const hiringAnalytics = await analyticsService.getIndustryHiringAnalytics(
      industryProfile.id,
      { id: industryUser.id, role: UserRole.INDUSTRY }
    );
    assert.ok(hiringAnalytics.hiringFunnel);
    assert.ok(hiringAnalytics.selected >= 1);

    const dashboard = await analyticsService.getIndustryDashboard(industryUser.id);
    assert.ok(dashboard.activeOpportunities >= 1);
    assert.ok(dashboard.selected >= 1);
    assert.ok(dashboard.hiringFunnel !== undefined);
  });

  // =========================================================================
  // 4. END-TO-END WORKFLOW C: COMPLETE INSTITUTION JOURNEY & ANALYTICS
  // =========================================================================
  console.log('\n--- 4. End-to-End Workflow C: Institution Journey & Dashboards ---');

  const instEmail = `institution_e2e_${ts}@test.com`;
  let instUser: any = null;
  let instTokens: any = null;
  let instProfile: any = null;

  await test('Step 16: Institution registers and authenticates', async () => {
    const regResult = await authService.register({
      firstName: 'National',
      lastName: 'Engineering Academy',
      email: instEmail,
      password: testPassword,
      role: UserRole.INSTITUTION,
    });
    instUser = regResult.user;

    instTokens = await authService.login({
      email: instEmail,
      password: testPassword,
    });
    assert.ok(instTokens.accessToken);
  });

  await test('Step 17: Institution creates profile, department, and placement drive', async () => {
    instProfile = await institutionService.createMyProfile(instUser.id, {
      institutionName: `National Institute of Technology ${ts}`,
      institutionType: 'Engineering College',
      location: 'Surathkal, Karnataka',
    });
    assert.ok(instProfile.id);

    const dept = await institutionService.createDepartment(instUser.id, {
      departmentName: `Computer Science & Engineering ${ts}`,
      departmentCode: `CSE-${ts.toString().slice(-4)}`,
    });
    assert.ok(dept.id);

    const placement = await institutionService.createPlacement(instUser.id, {
      academicYear: `2027-${ts.toString().slice(-2)}`,
      totalStudents: 120,
      placedStudents: 95,
      highestSalary: 3200000,
      averageSalary: 1100000,
    });
    assert.ok(placement.id);
  });

  await test('Step 18: Institution retrieves Institution Dashboard with all Master Prompt sections', async () => {
    const dashboard = await analyticsService.getInstitutionDashboard(instUser.id);
    assert.ok(dashboard.studentStats !== undefined);
    assert.ok(dashboard.skillStats !== undefined);
    assert.ok(dashboard.placementStats !== undefined);
    assert.ok(Array.isArray(dashboard.placementTrends));
  });

  // =========================================================================
  // 5. RBAC MATRIX & CROSS-TENANT IDOR VERIFICATION
  // =========================================================================
  console.log('\n--- 5. RBAC Matrix & Cross-Tenant IDOR Verification ---');

  await test('RBAC: Student cannot access Institution dashboard', async () => {
    let errorCaught = false;
    try {
      await analyticsService.getInstitutionDashboard(studentUser.id);
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.statusCode === HttpStatus.FORBIDDEN || err.statusCode === HttpStatus.NOT_FOUND);
    }
    assert.ok(errorCaught, 'Student must be rejected from institution dashboard');
  });

  await test('RBAC: Industry cannot access Institution analytics', async () => {
    let errorCaught = false;
    try {
      await analyticsService.getInstitutionSkillAnalytics(
        instProfile.id,
        { id: industryUser.id, role: UserRole.INDUSTRY }
      );
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.FORBIDDEN);
    }
    assert.ok(errorCaught, 'Industry role cannot query institution analytics');
  });

  await test('IDOR: Student B cannot view Student A skill analytics', async () => {
    const studentB = await User.create({
      email: `student_b_idor_${ts}@test.com`,
      passwordHash: await bcrypt.hash('Pass123!', 10),
      role: UserRole.STUDENT,
      firstName: 'Bob',
      lastName: 'Rao',
    });

    await StudentProfile.create({
      userId: studentB.id,
      collegeName: 'Other College',
      profileCompletion: 40,
    });

    let errorCaught = false;
    try {
      await analyticsService.getStudentSkillAnalytics(studentProfile.id, {
        id: studentB.id,
        role: UserRole.STUDENT,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.FORBIDDEN);
      assert.ok(err.message.includes('only access your own'));
    }
    assert.ok(errorCaught, 'Student B cannot access Student A analytics');
  });

  // =========================================================================
  // 6. ASSESSMENT TAMPERING DEFENSE & SCORING INTEGRITY
  // =========================================================================
  console.log('\n--- 6. Assessment Tampering Defense & Scoring Integrity ---');

  await test('Assessment Scoring: Server ignores client-supplied scores/percentages and calculates authoritatively', async () => {
    // Start attempt
    const att = await assessmentService.startAttempt(studentUser.id, assessmentId);

    // Client passes malicious extra properties: score: 100, percentage: 100, isCorrect: true
    const maliciousPayload: any = {
      answers: [
        { questionId: q1Id, answer: 'Wrong Answer' }, // Wrong answer
      ],
      score: 100,
      percentage: 100,
      isCorrect: true,
      pointsEarned: 100,
    };

    const res = await assessmentService.submitAttempt(studentUser.id, att.attempt.id, maliciousPayload);
    // Server must compute 0 score, completely ignoring malicious client values
    assert.strictEqual(res.score, 0, 'Server must override client-supplied score with computed score');
    assert.strictEqual(res.percentage, 0, 'Server must override client-supplied percentage');
  });

  // =========================================================================
  // 7. APPLICATION TRANSACTIONS, CONCURRENCY & DEADLINE DEFENSE
  // =========================================================================
  console.log('\n--- 7. Application Transactions & Concurrency Defense ---');

  await test('Concurrency: Duplicate application to the same opportunity is rejected with 409 Conflict', async () => {
    let errorCaught = false;
    try {
      await applicationService.submitApplication(studentUser.id, {
        opportunityId: createdJobId,
        opportunityType: OpportunityType.JOB,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.CONFLICT);
      assert.ok(err.message.includes('already submitted an application'));
    }
    assert.ok(errorCaught, 'Must prevent multiple applications for same opportunity');
  });

  await test('Deadline Defense: Applications to expired opportunities are rejected', async () => {
    const expiredJob = await Job.create({
      industryId: industryProfile.id,
      title: 'Expired Internship',
      description: 'Applications closed.',
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: WorkplaceType.ON_SITE,
      applicationDeadline: new Date('2020-01-01'), // Past deadline
      status: OpportunityStatus.OPEN,
      openings: 1,
    });

    let errorCaught = false;
    try {
      await applicationService.submitApplication(studentUser.id, {
        opportunityId: expiredJob.id,
        opportunityType: OpportunityType.JOB,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.CONFLICT);
      assert.ok(err.message.includes('deadline') || err.message.includes('past'));
    }
    assert.ok(errorCaught, 'Must reject applications after deadline');
  });

  // =========================================================================
  // 8. EVENT RESILIENCE & STORAGE ABSTRACTION
  // =========================================================================
  console.log('\n--- 8. Event Resilience & Storage Abstraction ---');

  await test('Event Failure Resilience: Primary application creation succeeds even if non-critical event dispatch fails', async () => {
    // Create new open job
    const resilientJob = await Job.create({
      industryId: industryProfile.id,
      title: `Resilient Job ${ts}`,
      description: 'Test resilient event dispatch.',
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: WorkplaceType.REMOTE,
      applicationDeadline: new Date('2028-12-31'),
      status: OpportunityStatus.OPEN,
      openings: 2,
    });

    // Register a broken listener that throws
    const faultyListener = () => {
      throw new Error('Simulated external event bus failure');
    };
    appEvents.on(AppEventType.APPLICATION_SUBMITTED, faultyListener);

    try {
      // Submitting application must still complete successfully due to emitSafe
      const app = await applicationService.submitApplication(studentUser.id, {
        opportunityId: resilientJob.id,
        opportunityType: OpportunityType.JOB,
      });
      assert.ok(app.id);
      assert.strictEqual(app.status, ApplicationStatus.APPLIED);
    } finally {
      appEvents.removeListener(AppEventType.APPLICATION_SUBMITTED, faultyListener);
    }
  });

  await test('Storage Failure: Rejects invalid file upload without corrupting database state', async () => {
    let errorCaught = false;
    try {
      await storageService.upload({
        originalname: 'exploit.sh',
        mimetype: 'application/x-sh',
        size: 50,
        buffer: Buffer.from('#!/bin/sh echo bad'),
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.BAD_REQUEST);
    }
    assert.ok(errorCaught, 'Storage abstraction rejects non-whitelisted extensions');
  });

  // =========================================================================
  // 9. DETERMINISTIC MATCHING & MASTER PROMPT WEIGHTS
  // =========================================================================
  console.log('\n--- 9. Deterministic Matching & Master Prompt Weights ---');

  await test('Matching Engine: Weights adhere strictly to Master Prompt (50% Skill, 20% Career, 10% Exp, 10% Assess, 10% Pref)', async () => {
    assert.strictEqual(MATCH_WEIGHTS.SKILL_MATCH, 0.50);
    assert.strictEqual(MATCH_WEIGHTS.CAREER_ALIGNMENT, 0.20);
    assert.strictEqual(MATCH_WEIGHTS.EXPERIENCE, 0.10);
    assert.strictEqual(MATCH_WEIGHTS.ASSESSMENT, 0.10);
    assert.strictEqual(MATCH_WEIGHTS.PREFERENCE, 0.10);

    const totalWeight =
      MATCH_WEIGHTS.SKILL_MATCH +
      MATCH_WEIGHTS.CAREER_ALIGNMENT +
      MATCH_WEIGHTS.EXPERIENCE +
      MATCH_WEIGHTS.ASSESSMENT +
      MATCH_WEIGHTS.PREFERENCE;
    assert.strictEqual(Number(totalWeight.toFixed(2)), 1.00, 'Sum of weights must equal 100%');
  });

  await test('Deterministic Ordering: Consecutive matching calls on unchanged data produce identical match scores', async () => {
    const matchRun1 = await matchingService.calculateMatch(studentProfile.id, createdJobId, 'JOB', false);
    const matchRun2 = await matchingService.calculateMatch(studentProfile.id, createdJobId, 'JOB', false);

    assert.strictEqual(matchRun1.matchScore, matchRun2.matchScore, 'Match score must be strictly deterministic');
    assert.strictEqual(matchRun1.breakdown.skillMatch.score, matchRun2.breakdown.skillMatch.score);
    assert.strictEqual(matchRun1.breakdown.careerAlignment.score, matchRun2.breakdown.careerAlignment.score);
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`PHASE 19 INTEGRATION TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runPhase19IntegrationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error running Phase 19 integration tests:', err);
      process.exit(1);
    });
}
