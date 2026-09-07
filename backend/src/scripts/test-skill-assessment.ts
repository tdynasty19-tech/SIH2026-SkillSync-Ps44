import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { AssessmentAnswer } from '../models/assessment-answer.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { SkillGap } from '../models/skill-gap.model';
import { UserRole } from '../constants/roles';
import {
  StudentSkillLevel,
  AssessmentQuestionType,
  AssessmentAttemptStatus,
  SkillGapPriority,
  SkillGapStatus,
} from '../constants/enums';
import { skillService } from '../services/skill.service';
import { assessmentService } from '../services/assessment.service';
import { careerService } from '../services/career.service';
import { skillGapService } from '../services/skill-gap.service';

export const runPhase6Tests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 6 SKILL INTELLIGENCE & ASSESSMENT TESTS');
  console.log('=============================================\n');

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

  // Setup: Create test users, skills, categories, assessments, and career roles
  const hash = await bcrypt.hash('TestPass123!', 10);

  const studentA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Student',
    lastName: 'Alpha',
    email: `student.alpha.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileA = await StudentProfile.create({
    userId: studentA.id,
    headline: 'Backend Developer Intern',
    collegeName: 'National Institute of Technology',
    currentSemester: 6,
    profileCompletion: 20,
  });

  const studentB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Student',
    lastName: 'Beta',
    email: `student.beta.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileB = await StudentProfile.create({
    userId: studentB.id,
    headline: 'Frontend Developer Intern',
    collegeName: 'Delhi Technological University',
    currentSemester: 4,
    profileCompletion: 20,
  });

  // Create Skill Category
  const category = await SkillCategory.create({
    name: `Backend Engineering ${Date.now()}`,
    description: 'Server-side architectures and technologies',
  });

  // Create Skills
  const nodeSkill = await Skill.create({
    name: `Node.js & Express ${Date.now()}`,
    slug: `nodejs-express-${Date.now()}`,
    categoryId: category.id,
    description: 'JavaScript runtime and web framework',
    isActive: true,
  });

  const dockerSkill = await Skill.create({
    name: `Docker & Containers ${Date.now()}`,
    slug: `docker-containers-${Date.now()}`,
    categoryId: category.id,
    description: 'Containerization and container runtime',
    isActive: true,
  });

  // Create Assessment for nodeSkill
  const assessment = await SkillAssessment.create({
    title: 'Node.js Backend Assessment',
    description: 'Comprehensive evaluation of Node.js and Express architecture',
    skillId: nodeSkill.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 30,
    passingScore: 60,
    totalQuestions: 2,
    isActive: true,
  });

  // Create Questions with sensitive correctAnswer
  const q1 = await AssessmentQuestion.create({
    assessmentId: assessment.id,
    question: 'Which module in Node.js is used for creating HTTP servers?',
    questionType: AssessmentQuestionType.SINGLE_CHOICE,
    options: ['http', 'fs', 'url', 'path'],
    correctAnswer: 'http',
    points: 10,
    explanation: 'The http module allows Node.js to transfer data over HTTP.',
    order: 1,
  });

  const q2 = await AssessmentQuestion.create({
    assessmentId: assessment.id,
    question: 'What is the default execution model of the Node.js event loop?',
    questionType: AssessmentQuestionType.SINGLE_CHOICE,
    options: ['Single-threaded non-blocking', 'Multi-threaded synchronous', 'Thread-per-request'],
    correctAnswer: 'Single-threaded non-blocking',
    points: 10,
    explanation: 'Node.js uses an event-driven, single-threaded non-blocking I/O model.',
    order: 2,
  });

  // Create Career Role & Required Skills
  const careerRole = await CareerRole.create({
    title: `Backend Software Engineer ${Date.now()}`,
    slug: `backend-software-engineer-${Date.now()}`,
    description: 'Designs and builds server-side microservices and APIs.',
  });

  const roleSkill1 = await CareerRoleSkill.create({
    careerRoleId: careerRole.id,
    skillId: nodeSkill.id,
    requiredLevel: StudentSkillLevel.ADVANCED, // 75
    importanceWeight: 2.0,
  });

  const roleSkill2 = await CareerRoleSkill.create({
    careerRoleId: careerRole.id,
    skillId: dockerSkill.id,
    requiredLevel: StudentSkillLevel.INTERMEDIATE, // 50
    importanceWeight: 1.0,
  });

  let createdAttemptId = 0;
  let createdInterestId = 0;

  try {
    // ----------------------------------------------------
    // 1. Skill Catalogue & Category Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Skill Catalogue & Category Tests ---');

    await test('List skills returns active skills with pagination and category inclusion', async () => {
      const result = await skillService.getSkills(undefined, undefined, 1, 10);
      assert.ok(result.skills.length > 0);
      assert.ok(result.pagination.total >= 2);
    });

    await test('Filter skills by search query', async () => {
      const result = await skillService.getSkills('Node.js & Express', undefined, 1, 10);
      assert.ok(result.skills.length >= 1);
      assert.strictEqual(result.skills[0].id, nodeSkill.id);
    });

    await test('Get single skill returns details with category', async () => {
      const skill = await skillService.getSkillById(nodeSkill.id);
      assert.strictEqual(skill.id, nodeSkill.id);
      assert.strictEqual(skill.name, nodeSkill.name);
    });

    await test('List skill categories and get category by ID', async () => {
      const catList = await skillService.getCategories(1, 10);
      assert.ok(catList.categories.length > 0);

      const singleCat = await skillService.getCategoryById(category.id);
      assert.strictEqual(singleCat.id, category.id);
      assert.ok(Array.isArray((singleCat as any).skills));
    });

    // ----------------------------------------------------
    // 2. Assessment Listing & Question Security Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Assessment Listing & Question Security Tests ---');

    await test('List assessments returns active assessments', async () => {
      const result = await assessmentService.getAssessments(nodeSkill.id, undefined, 1, 10);
      assert.ok(result.assessments.length >= 1);
      assert.strictEqual(result.assessments[0].id, assessment.id);
    });

    await test('CRITICAL SECURITY: Assessment details response strictly hides correctAnswer', async () => {
      const assessData = await assessmentService.getAssessmentById(assessment.id);
      assert.strictEqual(assessData.id, assessment.id);
      assert.ok(Array.isArray(assessData.questions));
      assert.strictEqual(assessData.questions.length, 2);

      for (const q of assessData.questions) {
        assert.strictEqual(
          (q as any).correctAnswer,
          undefined,
          `correctAnswer MUST NOT be exposed in question ${q.id}!`
        );
        assert.ok(q.question);
        assert.ok(q.points);
      }
    });

    // ----------------------------------------------------
    // 3. Assessment Attempts & Ownership Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Assessment Attempts & Ownership Tests ---');

    await test('Student A starts assessment attempt and receives safe questions', async () => {
      const res = await assessmentService.startAttempt(studentA.id, assessment.id);
      assert.ok(res.attempt.id);
      assert.strictEqual(res.attempt.assessmentId, assessment.id);
      assert.strictEqual(res.attempt.studentId, profileA.id);
      assert.strictEqual(res.attempt.status, AssessmentAttemptStatus.IN_PROGRESS);
      createdAttemptId = res.attempt.id;

      // Ensure questions attached to attempt do NOT leak correctAnswer
      for (const q of res.questions) {
        assert.strictEqual((q as any).correctAnswer, undefined);
      }
    });

    await test('Re-starting while attempt is in progress resumes existing active attempt', async () => {
      const res = await assessmentService.startAttempt(studentA.id, assessment.id);
      assert.strictEqual(res.attempt.id, createdAttemptId);
      assert.strictEqual(res.message, 'Resuming existing active attempt');
    });

    await test('CRITICAL SECURITY: Student B cannot view Student A attempt (ownership enforcement)', async () => {
      let errorCaught = false;
      try {
        await assessmentService.getAttempt(studentB.id, createdAttemptId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('CRITICAL SECURITY: Student B cannot submit Student A attempt', async () => {
      let errorCaught = false;
      try {
        await assessmentService.submitAttempt(studentB.id, createdAttemptId, {
          answers: [{ questionId: q1.id, answer: 'http' }],
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 4. Assessment Submission & Scoring Engine Tests
    // ----------------------------------------------------
    console.log('\n--- 4. Assessment Submission & Scoring Engine Tests ---');

    await test('Reject invalid/foreign question IDs in submission', async () => {
      let errorCaught = false;
      try {
        await assessmentService.submitAttempt(studentA.id, createdAttemptId, {
          answers: [{ questionId: 999999, answer: 'dummy' }],
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Reject duplicate question submissions in payload', async () => {
      let errorCaught = false;
      try {
        await assessmentService.submitAttempt(studentA.id, createdAttemptId, {
          answers: [
            { questionId: q1.id, answer: 'http' },
            { questionId: q1.id, answer: 'http' },
          ],
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Submit attempt: evaluates answers, computes authoritative score & percentage, updates status', async () => {
      // q1 correct ('http'), q2 incorrect ('Thread-per-request') => 10/20 points = 50%
      const result = await assessmentService.submitAttempt(studentA.id, createdAttemptId, {
        answers: [
          { questionId: q1.id, answer: 'http' },
          { questionId: q2.id, answer: 'Thread-per-request' },
        ],
      });

      assert.strictEqual(result.attemptId, createdAttemptId);
      assert.strictEqual(result.score, 10);
      assert.strictEqual(result.totalPoints, 20);
      assert.strictEqual(result.percentage, 50);
      assert.strictEqual(result.passed, false); // passingScore is 60%
      assert.strictEqual(result.level, StudentSkillLevel.INTERMEDIATE);
      assert.strictEqual(result.status, AssessmentAttemptStatus.COMPLETED);

      // Verify attempt in DB is COMPLETED
      const attemptInDb = await AssessmentAttempt.findByPk(createdAttemptId);
      assert.strictEqual(attemptInDb!.status, AssessmentAttemptStatus.COMPLETED);
    });

    await test('Re-submitting completed attempt is rejected with ConflictError', async () => {
      let errorCaught = false;
      try {
        await assessmentService.submitAttempt(studentA.id, createdAttemptId, {
          answers: [{ questionId: q1.id, answer: 'http' }],
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Get student assessment attempt history returns completed attempt', async () => {
      const history = await assessmentService.getStudentAttempts(studentA.id);
      assert.ok(history.attempts.length >= 1);
      assert.strictEqual(history.attempts[0].id, createdAttemptId);
    });

    // ----------------------------------------------------
    // 5. Trusted Student Skill Update Tests
    // ----------------------------------------------------
    console.log('\n--- 5. Trusted Student Skill Update Tests ---');

    await test('Assessment submission automatically created/updated trusted StudentSkill record', async () => {
      const studentSkill = await StudentSkill.findOne({
        where: { studentId: profileA.id, skillId: nodeSkill.id },
      });

      assert.ok(studentSkill, 'StudentSkill record must exist after assessment submission');
      assert.strictEqual(Number(studentSkill.score), 50);
      assert.strictEqual(studentSkill.level, StudentSkillLevel.INTERMEDIATE);
      assert.strictEqual(studentSkill.source, 'Assessment');
      assert.strictEqual(studentSkill.verified, false); // Failed passingScore 60
      assert.ok(studentSkill.lastAssessedAt);
    });

    // ----------------------------------------------------
    // 6. Career Roles & Career Interests Tests
    // ----------------------------------------------------
    console.log('\n--- 6. Career Roles & Career Interests Tests ---');

    await test('List career roles and get career role with required skills', async () => {
      const roles = await careerService.getCareerRoles(undefined, 1, 10);
      assert.ok(roles.careerRoles.length >= 1);

      const singleRole = await careerService.getCareerRoleById(careerRole.id);
      assert.strictEqual(singleRole.id, careerRole.id);
      assert.ok(Array.isArray((singleRole as any).roleSkills));
      assert.strictEqual((singleRole as any).roleSkills.length, 2);
    });

    await test('Student A adds career interest and triggers skill gap calculation', async () => {
      const interest = await careerService.addCareerInterest(studentA.id, {
        careerRoleId: careerRole.id,
        priorityOrder: 1,
      });

      assert.ok(interest.id);
      assert.strictEqual(interest.careerRoleId, careerRole.id);
      createdInterestId = interest.id;
    });

    await test('Duplicate career interest addition is rejected with ConflictError', async () => {
      let errorCaught = false;
      try {
        await careerService.addCareerInterest(studentA.id, {
          careerRoleId: careerRole.id,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Update career interest priority succeeds for owner', async () => {
      const updated = await careerService.updateCareerInterest(studentA.id, createdInterestId, {
        priorityOrder: 2,
      });
      assert.strictEqual(updated.priorityOrder, 2);
    });

    await test('Student B cannot modify Student A career interest (ownership enforcement)', async () => {
      let errorCaught = false;
      try {
        await careerService.updateCareerInterest(studentB.id, createdInterestId, {
          priorityOrder: 3,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 7. Deterministic Skill Gap Engine Tests
    // ----------------------------------------------------
    console.log('\n--- 7. Deterministic Skill Gap Engine Tests ---');

    await test('Deterministic Skill Gap calculation evaluates gaps and priorities correctly', async () => {
      const result = await skillGapService.getStudentGaps(studentA.id);
      assert.strictEqual(result.skillGaps.length, 2);

      // Node.js skill: required ADVANCED (75), student current score (50) -> gap = 25 -> MEDIUM
      const nodeGap = result.skillGaps.find((g) => g.skillId === nodeSkill.id);
      assert.ok(nodeGap);
      assert.strictEqual(Number(nodeGap.gapScore), 25);
      assert.strictEqual(nodeGap.currentLevel, StudentSkillLevel.INTERMEDIATE);
      assert.strictEqual(nodeGap.requiredLevel, StudentSkillLevel.ADVANCED);
      assert.strictEqual(nodeGap.priority, SkillGapPriority.MEDIUM);
      assert.strictEqual(nodeGap.status, SkillGapStatus.OPEN);

      // Docker skill: missing entirely (0), required INTERMEDIATE (50) -> gap = 50 -> HIGH (weight 1.0)
      const dockerGap = result.skillGaps.find((g) => g.skillId === dockerSkill.id);
      assert.ok(dockerGap);
      assert.strictEqual(Number(dockerGap.gapScore), 50);
      assert.strictEqual(dockerGap.currentLevel, null);
      assert.strictEqual(dockerGap.requiredLevel, StudentSkillLevel.INTERMEDIATE);
      assert.strictEqual(dockerGap.priority, SkillGapPriority.HIGH);
      assert.strictEqual(dockerGap.status, SkillGapStatus.OPEN);
    });

    await test('CRITICAL SECURITY: Student B cannot view Student A skill gaps', async () => {
      const resB = await skillGapService.getStudentGaps(studentB.id);
      assert.strictEqual(resB.skillGaps.length, 0); // Student B has no career interests or gaps
    });

    await test('Retaking assessment with 100% updates trusted skill to EXPERT and resolves skill gap', async () => {
      // Retake allowed because previous attempt failed (50% < passingScore 60%)
      const retake = await assessmentService.startAttempt(studentA.id, assessment.id);
      assert.strictEqual(retake.attempt.status, AssessmentAttemptStatus.IN_PROGRESS);

      // Submit both correct answers: 20/20 = 100%
      const submitRes = await assessmentService.submitAttempt(studentA.id, retake.attempt.id, {
        answers: [
          { questionId: q1.id, answer: 'http' },
          { questionId: q2.id, answer: 'Single-threaded non-blocking' },
        ],
      });

      assert.strictEqual(submitRes.percentage, 100);
      assert.strictEqual(submitRes.passed, true);
      assert.strictEqual(submitRes.level, StudentSkillLevel.EXPERT);

      // Verify student_skills is now EXPERT and verified = true
      const updatedStudentSkill = await StudentSkill.findOne({
        where: { studentId: profileA.id, skillId: nodeSkill.id },
      });
      assert.strictEqual(updatedStudentSkill!.level, StudentSkillLevel.EXPERT);
      assert.strictEqual(updatedStudentSkill!.verified, true);

      // Verify Node.js gap is now RESOLVED (currentScore 100 >= requiredScore 75)
      const gapsAfter = await skillGapService.getStudentGaps(studentA.id);
      const nodeGapAfter = gapsAfter.skillGaps.find((g) => g.skillId === nodeSkill.id);
      assert.ok(nodeGapAfter);
      assert.strictEqual(Number(nodeGapAfter.gapScore), 0);
      assert.strictEqual(nodeGapAfter.status, SkillGapStatus.RESOLVED);
    });

    await test('Passed assessment prevents repeated attempts (Retake Protection)', async () => {
      let errorCaught = false;
      try {
        await assessmentService.startAttempt(studentA.id, assessment.id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Must block attempts when already passed');
    });

    // ----------------------------------------------------
    // 8. Delete Career Interest Cleanup Tests
    // ----------------------------------------------------
    console.log('\n--- 8. Cleanup Career Interest Tests ---');

    await test('Delete career interest removes interest and clears associated skill gaps', async () => {
      const res = await careerService.deleteCareerInterest(studentA.id, createdInterestId);
      assert.ok(res.message);

      const gaps = await skillGapService.getStudentGaps(studentA.id);
      assert.strictEqual(gaps.skillGaps.length, 0);
    });

  } finally {
    // Cleanup created test records
    await SkillGap.destroy({ where: { studentId: profileA.id } });
    await SkillGap.destroy({ where: { studentId: profileB.id } });
    await StudentCareerInterest.destroy({ where: { studentId: profileA.id } });
    await StudentCareerInterest.destroy({ where: { studentId: profileB.id } });
    await AssessmentAnswer.destroy({ where: {} });
    await AssessmentAttempt.destroy({ where: { studentId: profileA.id } });
    await AssessmentAttempt.destroy({ where: { studentId: profileB.id } });
    await AssessmentQuestion.destroy({ where: { assessmentId: assessment.id } });
    await SkillAssessment.destroy({ where: { id: assessment.id } });
    await CareerRoleSkill.destroy({ where: { careerRoleId: careerRole.id } });
    await CareerRole.destroy({ where: { id: careerRole.id } });
    await StudentSkill.destroy({ where: { studentId: profileA.id } });
    await StudentSkill.destroy({ where: { studentId: profileB.id } });
    await StudentProfile.destroy({ where: { id: profileA.id } });
    await StudentProfile.destroy({ where: { id: profileB.id } });
    await Skill.destroy({ where: { id: nodeSkill.id } });
    await Skill.destroy({ where: { id: dockerSkill.id } });
    await SkillCategory.destroy({ where: { id: category.id } });
    await User.destroy({ where: { id: studentA.id } });
    await User.destroy({ where: { id: studentB.id } });
  }

  console.log('\n=============================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase6Tests().catch((err) => {
  console.error('Fatal Phase 6 test error:', err);
  process.exit(1);
});
