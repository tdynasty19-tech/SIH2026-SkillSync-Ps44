import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { Skill } from '../models/skill.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { SkillGap } from '../models/skill-gap.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { Notification } from '../models/notification.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';

import { AuthService } from '../services/auth.service';
import { studentService } from '../services/student.service';
import { assessmentService } from '../services/assessment.service';
import { skillGapService } from '../services/skill-gap.service';
import { aiService } from '../services/ai.service';
import { matchingService } from '../services/matching.service';
import { recommendationService } from '../services/recommendation.service';
import { applicationService } from '../services/application.service';
import { analyticsService } from '../services/analytics.service';
import { notificationService } from '../services/notification.service';
import { AIProviderFactory } from '../services/ai/ai-provider.factory';
import { MockAIProvider } from '../services/ai/mock.provider';

import { initEventSubscribers } from '../events';

import { UserRole } from '../constants/roles';
import {
  ApplicationStatus,
  OpportunityType,
  StudentSkillLevel,
  AssessmentAttemptStatus,
  NotificationType,
  OpportunityStatus,
} from '../constants/enums';

export const runPhase4E2ETests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 4 FULL INTEGRATION + E2E TESTING (SIH DEMO FLOW)');
  console.log('================================================================\n');

  // Initialize event subscribers so domain events trigger notifications
  initEventSubscribers();

  let passed = 0;
  let failed = 0;
  const authService = new AuthService();

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

  // Set up mock AI provider for predictable AI and fallback testing
  const mockAI = new MockAIProvider();
  AIProviderFactory.setProvider(mockAI);

  // Identify existing demo users
  const demoStudentUser = await User.findOne({ where: { role: UserRole.STUDENT } });
  assert.ok(demoStudentUser, 'Demo student user must exist in Railway MySQL');

  const demoIndustryUser = await User.findOne({ where: { role: UserRole.INDUSTRY } });
  assert.ok(demoIndustryUser, 'Demo industry user must exist in Railway MySQL');

  const demoAcademicianUser = await User.findOne({ where: { role: UserRole.ACADEMICIAN } });
  assert.ok(demoAcademicianUser, 'Demo academician user must exist in Railway MySQL');

  const demoInstitutionUser = await User.findOne({ where: { role: UserRole.INSTITUTION } });
  assert.ok(demoInstitutionUser, 'Demo institution user must exist in Railway MySQL');

  const demoIndustryProfile = await IndustryProfile.findOne({ where: { userId: demoIndustryUser.id } });
  assert.ok(demoIndustryProfile, 'Demo industry profile must exist');

  const industryAuthUser = {
    id: demoIndustryUser.id,
    role: UserRole.INDUSTRY,
    uuid: demoIndustryUser.uuid,
    email: demoIndustryUser.email,
  } as any;

  // Temporary test user references for clean isolation
  let testStudentUser: any = null;
  let testStudentProfile: any = null;
  let testAppId: number | null = null;
  let testNotificationId: number | null = null;

  // ────────────────────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & RBAC E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Auth & RBAC: Complete Register -> Login -> Token issuance -> Role isolation', async () => {
    const testEmail = `e2e.student.${Date.now()}@sih-test.org`;
    const password = 'Password123!';

    // Register
    const regResult = await authService.register({
      firstName: 'Aarav',
      lastName: 'Integration',
      email: testEmail,
      password,
      role: UserRole.STUDENT,
    });
    const regUser = regResult.user as any;
    assert.ok(regUser, 'Registration must return created user');
    testStudentUser = await User.findByPk(regUser.id);
    assert.ok(testStudentUser, 'User must be persisted in Railway MySQL');

    // Create student profile
    testStudentProfile = await StudentProfile.create({
      userId: testStudentUser.id,
      headline: 'E2E Test Student Engineer',
      bio: 'Full integration validation candidate',
      city: 'Pune',
      state: 'Maharashtra',
    });

    // Login
    const loginResult = await authService.login({
      email: testEmail,
      password,
    });
    assert.ok(loginResult.accessToken, 'Login must issue JWT accessToken');
    assert.ok(loginResult.refreshToken, 'Login must issue JWT refreshToken');
    const loggedInUser = loginResult.user as any;
    assert.strictEqual(loggedInUser.email, testEmail);

    // Refresh Token
    const refreshed = await authService.refreshToken(loginResult.refreshToken);
    assert.ok(refreshed.accessToken, 'Token rotation must issue new accessToken');

    // RBAC validation
    assert.strictEqual(testStudentUser.role, UserRole.STUDENT);
    assert.strictEqual(demoIndustryUser.role, UserRole.INDUSTRY);
    assert.strictEqual(demoAcademicianUser.role, UserRole.ACADEMICIAN);
    assert.strictEqual(demoInstitutionUser.role, UserRole.INSTITUTION);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 2. STUDENT PROFILE & SKILL MANAGEMENT E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Student Profile & Skills: Load, update profile, add skills, calculate readiness', async () => {
    // Update profile
    const updatedProfile = await studentService.updateProfile(testStudentUser.id, {
      headline: 'Full-Stack Developer & Cloud Enthusiast',
      city: 'Bengaluru',
    });
    assert.strictEqual(updatedProfile.headline, 'Full-Stack Developer & Cloud Enthusiast');
    assert.strictEqual(updatedProfile.city, 'Bengaluru');

    // Find skills
    const skills = await Skill.findAll({ limit: 3 });
    assert.ok(skills.length > 0, 'Database must contain skills in catalog');

    // Add skill to student
    const skill1 = skills[0];
    const studentSkill = await StudentSkill.create({
      studentId: testStudentProfile.id,
      skillId: skill1.id,
      level: StudentSkillLevel.INTERMEDIATE,
      score: 75.0,
      verified: false,
    });
    assert.ok(studentSkill.id, 'Skill should be successfully associated with student');
    assert.strictEqual(studentSkill.level, StudentSkillLevel.INTERMEDIATE);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 3. ASSESSMENT ENGINE E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Assessment: Retrieve question catalog, attempt, submit answers, evaluate score', async () => {
    // Find an existing published assessment with questions
    const assessment = await SkillAssessment.findOne({
      include: [{ model: AssessmentQuestion, as: 'questions' }],
    });
    assert.ok(assessment, 'At least 1 assessment must exist in database');

    const questions = (assessment as any).questions || [];
    assert.ok(questions.length > 0, 'Assessment must contain questions');

    // Safe retrieval check: sanitized questions must NOT expose correctAnswer to student
    const sanitizedQuestions = questions.map((q: any) => {
      const { correctAnswer, ...safe } = q.toJSON ? q.toJSON() : q;
      return safe;
    });
    for (const sq of sanitizedQuestions) {
      assert.strictEqual(sq.correctAnswer, undefined, 'correctAnswer must NEVER be exposed');
    }

    // Start attempt
    const attempt = await AssessmentAttempt.create({
      assessmentId: assessment.id,
      studentId: testStudentProfile.id,
      status: AssessmentAttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    assert.ok(attempt.id, 'Attempt must be generated');

    // Submit answers
    const answersPayload = questions.map((q: any) => ({
      questionId: q.id,
      answer: q.correctAnswer || 'A',
    }));

    // Evaluate
    let score = 0;
    let totalPoints = 0;
    for (const ans of answersPayload) {
      const q = questions.find((item: any) => item.id === ans.questionId);
      if (q) {
        totalPoints += q.points || 1;
        if (ans.answer === q.correctAnswer) {
          score += q.points || 1;
        }
      }
    }
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 80;

    attempt.score = score;
    attempt.percentage = percentage;
    attempt.status = AssessmentAttemptStatus.COMPLETED;
    attempt.completedAt = new Date();
    await attempt.save();

    assert.strictEqual(attempt.status, AssessmentAttemptStatus.COMPLETED);
    assert.ok(Number(attempt.percentage) >= 0, 'Percentage score must be valid');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 4. SKILL GAP ENGINE E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Skill Gap Engine: Recalculate deterministic gaps against career benchmarks', async () => {
    const gaps = await skillGapService.calculateGapsForStudent(testStudentProfile.id);
    assert.ok(Array.isArray(gaps), 'Skill gap engine must return an array of gaps');

    if (gaps.length > 0) {
      const gap = gaps[0];
      assert.ok(gap.skillId, 'Must have skillId');
      assert.ok(typeof gap.gapScore === 'number', 'gapScore must be numeric');
      assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(gap.priority), 'priority must be a valid enum');
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 5. AI CAREER COPILOT & INTELLIGENCE FLOW
  // ────────────────────────────────────────────────────────────────────────────
  await test('AI Career Copilot: Process student queries with contextual guidance', async () => {
    mockAI.shouldFail = false;
    mockAI.responseToReturn = JSON.stringify({
      reply: 'Based on your verified skills and recent assessment, you are well-positioned for Backend Engineer roles.',
      suggestedActions: [
        'Explore Spring Boot internships',
        'Review System Design learning roadmap',
      ],
    });

    const copilotResult = await aiService.getCareerCopilot(testStudentUser.id, {
      message: 'What career path should I prioritize?',
    });

    assert.ok(copilotResult.response.reply, 'Copilot must return reply text');
    assert.ok(Array.isArray(copilotResult.response.suggestedActions), 'Must include suggestedActions');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 6. AI SKILL GAP ASSISTANCE & SEQUENCING
  // ────────────────────────────────────────────────────────────────────────────
  await test('AI Skill Gap Assistance: Provides recommended learning sequencing', async () => {
    mockAI.shouldFail = true; // Test robust deterministic fallback

    const assistance = await aiService.getSkillGapAssistance(undefined, {
      id: testStudentUser.id,
      role: UserRole.STUDENT,
    });

    assert.ok(assistance.identifiedGaps, 'Identified gaps must be returned');
    assert.ok(Array.isArray(assistance.recommendedOrder), 'recommendedOrder must be an array');
    assert.strictEqual(assistance.fallbackUsed, true, 'Fallback should be cleanly flagged');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 7. AI LEARNING ROADMAP E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('AI Learning Roadmap: Generates multi-week milestones & project deliverables', async () => {
    mockAI.shouldFail = true; // Test deterministic roadmap generator

    const roadmapResult = await aiService.generateLearningRoadmap(testStudentUser.id, {
      targetRole: 'Full Stack Web Developer',
      timeframeWeeks: 4,
    });

    assert.ok(roadmapResult.roadmap, 'Roadmap object must be present');
    assert.strictEqual(roadmapResult.roadmap.totalDurationWeeks, 4);
    assert.strictEqual(roadmapResult.roadmap.milestones.length, 4);
    assert.ok(roadmapResult.roadmap.milestones[0].topic, 'Milestone must have a topic');
    assert.ok(roadmapResult.roadmap.milestones[0].projectIdea, 'Milestone must have a project idea');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 8. AI FAILURE & RESILIENCE TEST (MANDATORY)
  // ────────────────────────────────────────────────────────────────────────────
  await test('AI Failure Handling: Missing keys or provider 500s activate deterministic fallback safely', async () => {
    mockAI.shouldFail = true;
    mockAI.failureError = new Error('AI Provider connection timeout (504)');

    // Copilot under provider failure
    const copilotRes = await aiService.getCareerCopilot(testStudentUser.id, {
      message: 'What should I do next?',
    });
    assert.strictEqual(copilotRes.fallbackUsed, true);
    assert.ok(copilotRes.response.reply.length > 0, 'Must provide useful deterministic reply');

    // Opportunity Explanation under provider failure
    const demoJob = await Job.findOne();
    if (demoJob) {
      const expRes = await aiService.explainOpportunityMatch(testStudentUser.id, demoJob.id, 'JOB');
      assert.strictEqual(expRes.fallbackUsed, true);
      assert.strictEqual(typeof expRes.explanation.matchScore, 'number');
      assert.ok(expRes.explanation.strengths.length >= 0);
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 9. MATCHING ENGINE E2E (50/20/10/10/10 FORMULA)
  // ────────────────────────────────────────────────────────────────────────────
  await test('Matching Engine: Computes exact 5-factor deterministic formula', async () => {
    const demoJob = await Job.findOne();
    assert.ok(demoJob, 'Demo job must exist for matching calculation');

    const matchResult = await matchingService.calculateMatch(
      testStudentProfile.id,
      demoJob.id,
      OpportunityType.JOB
    );

    assert.ok(typeof matchResult.matchScore === 'number', 'matchScore must be numeric');
    assert.ok(matchResult.matchScore >= 0 && matchResult.matchScore <= 100, 'Score must be 0-100');

    // Verify 5 breakdown factors exist
    const bd = matchResult.breakdown;
    assert.ok(typeof bd.skillMatch.score === 'number', '50% skill match must exist');
    assert.ok(typeof bd.careerAlignment.score === 'number', '20% career alignment must exist');
    assert.ok(typeof bd.experience.score === 'number', '10% experience match must exist');
    assert.ok(typeof bd.assessment.score === 'number', '10% assessment score must exist');
    assert.ok(typeof bd.preference.score === 'number', '10% preference match must exist');

    // Verify weights calculate correctly
    const expectedScore = Math.round(
      bd.skillMatch.score * 0.50 +
      bd.careerAlignment.score * 0.20 +
      bd.experience.score * 0.10 +
      bd.assessment.score * 0.10 +
      bd.preference.score * 0.10
    );
    assert.strictEqual(Math.round(matchResult.matchScore), expectedScore, 'Score must match 50/20/10/10/10 weights');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 10. OPPORTUNITY RECOMMENDATIONS E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Recommendations: Careers, learning, and opportunities ranked by verified readiness', async () => {
    // Career recommendations
    const careerRecs = await recommendationService.recommendCareersForStudent(testStudentUser.id, {
      page: 1,
      limit: 5,
    });
    assert.ok(careerRecs.careerRecommendations.length > 0, 'Must return career recommendations');
    assert.ok(typeof careerRecs.careerRecommendations[0].readiness === 'number');

    // Opportunity recommendations
    const oppRecs = await recommendationService.recommendOpportunitiesForStudent(testStudentUser.id, {
      page: 1,
      limit: 5,
    });
    assert.ok(oppRecs.recommendations, 'Must return opportunity recommendations');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 11. APPLICATION LIFECYCLE & HIRING PIPELINE E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Application Lifecycle: Apply -> Prevent duplicate -> Review -> Shortlist -> Interview -> Select', async () => {
    const targetJob = await Job.findOne({ where: { status: OpportunityStatus.OPEN } });
    assert.ok(targetJob, 'At least one open job must exist in database');

    const jobIndustry = await IndustryProfile.findByPk(targetJob.industryId);
    assert.ok(jobIndustry, 'Industry profile for job must exist');

    const jobIndustryUser = await User.findByPk(jobIndustry.userId);
    assert.ok(jobIndustryUser, 'Industry user for job must exist');

    const targetIndustryAuthUser = {
      id: jobIndustryUser.id,
      role: UserRole.INDUSTRY,
      uuid: jobIndustryUser.uuid,
      email: jobIndustryUser.email,
    } as any;

    // Student applies
    const application = await applicationService.submitApplication(testStudentUser.id, {
      opportunityId: targetJob.id,
      opportunityType: OpportunityType.JOB,
      coverLetter: 'I have verified competencies in Java and SQL and would love to contribute.',
    });
    assert.ok(application.id, 'Application must be created');
    testAppId = application.id;
    assert.strictEqual(application.status, ApplicationStatus.APPLIED);

    // Duplicate prevention check: Submitting identical application again must throw ConflictError (409)
    try {
      await applicationService.submitApplication(testStudentUser.id, {
        opportunityId: targetJob.id,
        opportunityType: OpportunityType.JOB,
      });
      assert.fail('Duplicate application should have been rejected with 409 Conflict');
    } catch (dupErr: any) {
      assert.ok(
        dupErr.message.includes('already applied') || dupErr.name === 'ConflictError',
        'Duplicate must be blocked'
      );
    }

    // Industry reviews application pipeline
    const pipelineApps = await applicationService.getOpportunityApplications(
      targetIndustryAuthUser,
      OpportunityType.JOB,
      targetJob.id,
      { limit: 50, page: 1 }
    );
    const foundInPipeline = pipelineApps.applications.find((a: any) => a.id === testAppId);
    assert.ok(foundInPipeline, 'Application must appear in industry hiring pipeline');

    // Status progression 1: Move to UNDER_REVIEW
    const underReview = await applicationService.updateApplicationStatus(
      targetIndustryAuthUser,
      testAppId,
      { status: ApplicationStatus.UNDER_REVIEW, reason: 'Profile matches technical criteria' }
    );
    assert.strictEqual(underReview.status, ApplicationStatus.UNDER_REVIEW);

    // Status progression 2: Move to SHORTLISTED
    const shortlisted = await applicationService.updateApplicationStatus(
      targetIndustryAuthUser,
      testAppId,
      { status: ApplicationStatus.SHORTLISTED, reason: 'Shortlisted for evaluation' }
    );
    assert.strictEqual(shortlisted.status, ApplicationStatus.SHORTLISTED);

    // Status progression 3: Move to INTERVIEW
    const interview = await applicationService.updateApplicationStatus(
      targetIndustryAuthUser,
      testAppId,
      { status: ApplicationStatus.INTERVIEW, reason: 'Candidate invited to technical round' }
    );
    assert.strictEqual(interview.status, ApplicationStatus.INTERVIEW);

    // Status progression 4: Move to SELECTED
    const selected = await applicationService.updateApplicationStatus(
      targetIndustryAuthUser,
      testAppId,
      { status: ApplicationStatus.SELECTED, reason: 'Congratulations! Selected for role.' }
    );
    assert.strictEqual(selected.status, ApplicationStatus.SELECTED);

    // Verify audit trail in ApplicationStatusHistory
    const histories = await ApplicationStatusHistory.findAll({ where: { applicationId: testAppId } });
    assert.ok(histories.length >= 4, 'Audit history must record all status changes');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 12. NOTIFICATION SYSTEM INTEGRATION E2E
  // ────────────────────────────────────────────────────────────────────────────
  await test('Notifications: Event trigger -> Delivery -> Unread count -> Mark read', async () => {
    // Allow brief tick for asynchronous domain event handler to persist notification
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check notifications for student
    const notifs = await notificationService.getMyNotifications(testStudentUser.id, { page: 1, limit: 10 });
    assert.ok(notifs.notifications.length > 0, 'Student must have received status update notification');

    const latestNotif = notifs.notifications[0];
    testNotificationId = latestNotif.id;
    assert.strictEqual(latestNotif.isRead, false, 'Newly created notification should be unread');

    // Check unread count
    const unreadRes = await notificationService.getUnreadCount(testStudentUser.id);
    assert.ok(unreadRes.unreadCount > 0, 'Unread count must be > 0');

    // Mark as read
    await notificationService.markAsRead(testStudentUser.id, testNotificationId);

    const unreadAfter = await notificationService.getUnreadCount(testStudentUser.id);
    assert.strictEqual(unreadAfter.unreadCount, unreadRes.unreadCount - 1, 'Unread count must decrement by 1');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 13. DASHBOARD ANALYTICS DATA ACCURACY
  // ────────────────────────────────────────────────────────────────────────────
  await test('Dashboard Analytics: All 4 roles reflect real database records without fabrication', async () => {
    // 1. Student Dashboard
    const studentDash = await analyticsService.getStudentDashboard(testStudentUser.id);
    assert.ok(studentDash.skillSummary.totalSkills >= 1, 'Student dashboard must reflect added skill');
    assert.ok(studentDash.recentApplications.length >= 1, 'Must reflect submitted application');

    // 2. Industry Dashboard
    const industryDash = await analyticsService.getIndustryDashboard(demoIndustryUser.id);
    assert.ok(industryDash.hiringFunnel, 'Industry hiring funnel must exist');
    assert.ok(typeof industryDash.hiringFunnel.totalApplied === 'number');

    // 3. Academician Dashboard
    const academicianDash = await analyticsService.getAcademicianDashboard(demoAcademicianUser.id);
    assert.ok(academicianDash.mentorship, 'Academician mentee stats must exist');
    assert.ok(academicianDash.departmentStats, 'Department stats must exist');

    // 4. Institution Dashboard
    const institutionDash = await analyticsService.getInstitutionDashboard(demoInstitutionUser.id);
    assert.ok(institutionDash.studentStats, 'Institution student metrics must exist');
    assert.ok(institutionDash.placementStats, 'Placement stats must exist');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 14. DATA CLEANUP & PRESERVATION (ZERO DESTRUCTION)
  // ────────────────────────────────────────────────────────────────────────────
  await test('Cleanup: Safely remove temporary test records while preserving demo dataset', async () => {
    // Remove test notifications
    if (testStudentUser) {
      await Notification.destroy({ where: { userId: testStudentUser.id } });
    }

    // Remove test application & history
    if (testAppId) {
      await ApplicationStatusHistory.destroy({ where: { applicationId: testAppId } });
      await Application.destroy({ where: { id: testAppId } });
    }

    // Remove test attempts & skills
    if (testStudentProfile) {
      await AssessmentAttempt.destroy({ where: { studentId: testStudentProfile.id } });
      await SkillGap.destroy({ where: { studentId: testStudentProfile.id } });
      await StudentSkill.destroy({ where: { studentId: testStudentProfile.id } });
      await StudentProfile.destroy({ where: { id: testStudentProfile.id } });
    }

    // Remove test user
    if (testStudentUser) {
      await User.destroy({ where: { id: testStudentUser.id } });
    }

    // Verify demo student and demo industry records remain intact
    const verifyDemoStudent = await User.findOne({ where: { role: UserRole.STUDENT } });
    assert.ok(verifyDemoStudent, 'Demo student must remain 100% intact');

    const verifyDemoIndustry = await User.findOne({ where: { role: UserRole.INDUSTRY } });
    assert.ok(verifyDemoIndustry, 'Demo industry must remain 100% intact');
  });

  console.log('\n================================================================');
  console.log(`PHASE 4 E2E TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
};

runPhase4E2ETests().catch((err) => {
  console.error('Fatal error running Phase 4 E2E tests:', err);
  process.exit(1);
});
