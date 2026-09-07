import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentExperience } from '../models/student-experience.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Mentor } from '../models/mentor.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { OpportunityMatch } from '../models/opportunity-match.model';
import { CareerRecommendation } from '../models/career-recommendation.model';
import { LearningRecommendation } from '../models/learning-recommendation.model';
import { SkillGap } from '../models/skill-gap.model';
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
} from '../constants/enums';
import { matchingService, MATCH_WEIGHTS } from '../services/matching.service';
import { recommendationService } from '../services/recommendation.service';

export const runPhase14Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 14 MATCHING & RECOMMENDATION ENGINE TESTS');
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

  const hash = await bcrypt.hash('TestPass123!', 10);
  const ts = Date.now();

  // ----------------------------------------------------
  // Setup Test Fixtures: Skills, Categories, Roles
  // ----------------------------------------------------
  let category = await SkillCategory.findOne({ where: { name: 'Technical Skills' } });
  if (!category) {
    category = await SkillCategory.create({
      name: `Technical Skills ${ts}`,
      description: 'Technical proficiencies',
    });
  }

  const skillNode = await Skill.create({
    name: `Node.js ${ts}`,
    slug: `nodejs-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  const skillReact = await Skill.create({
    name: `React ${ts}`,
    slug: `react-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  const skillPython = await Skill.create({
    name: `Python ${ts}`,
    slug: `python-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  const skillDocker = await Skill.create({
    name: `Docker ${ts}`,
    slug: `docker-${ts}`,
    categoryId: category.id,
    isActive: true,
  });

  // Career Roles
  const roleFullStack = await CareerRole.create({
    title: `Full Stack Developer ${ts}`,
    slug: `full-stack-dev-${ts}`,
    description: 'Builds end to end web apps',
  });

  await CareerRoleSkill.create({
    careerRoleId: roleFullStack.id,
    skillId: skillNode.id,
    requiredLevel: StudentSkillLevel.INTERMEDIATE,
    importanceWeight: 1.0,
  });

  await CareerRoleSkill.create({
    careerRoleId: roleFullStack.id,
    skillId: skillReact.id,
    requiredLevel: StudentSkillLevel.INTERMEDIATE,
    importanceWeight: 1.0,
  });

  const roleDataEngineer = await CareerRole.create({
    title: `Data Engineer ${ts}`,
    slug: `data-engineer-${ts}`,
    description: 'Builds data pipelines',
  });

  await CareerRoleSkill.create({
    careerRoleId: roleDataEngineer.id,
    skillId: skillPython.id,
    requiredLevel: StudentSkillLevel.ADVANCED,
    importanceWeight: 1.0,
  });

  // ----------------------------------------------------
  // Setup Users: Student A, Student B, Industry A, Industry B, Mentor 1
  // ----------------------------------------------------
  // 1. Student A (Full Stack Profile)
  const userStudA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: `student.aarav.${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudA = await StudentProfile.create({
    userId: userStudA.id,
    headline: 'Aspiring Full Stack Engineer',
    collegeName: 'National Institute of Technology',
    department: 'Computer Science',
    city: 'Bangalore',
    state: 'Karnataka',
    availabilityStatus: 'AVAILABLE',
    careerGoal: `Full Stack Developer ${ts}`,
    profileCompletion: 85,
  });

  // Skills for Student A: Node.js (Intermediate), React (Advanced)
  await StudentSkill.create({
    studentId: profileStudA.id,
    skillId: skillNode.id,
    level: StudentSkillLevel.INTERMEDIATE,
    score: 50,
    verified: true,
  });

  await StudentSkill.create({
    studentId: profileStudA.id,
    skillId: skillReact.id,
    level: StudentSkillLevel.ADVANCED,
    score: 75,
    verified: true,
  });

  // Career Interest: Priority 1 Full Stack
  await StudentCareerInterest.create({
    studentId: profileStudA.id,
    careerRoleId: roleFullStack.id,
    priorityOrder: 1,
  });

  // Experience for Student A: 12 months frontend/fullstack
  const dateOneYearAgo = new Date();
  dateOneYearAgo.setFullYear(dateOneYearAgo.getFullYear() - 1);
  await StudentExperience.create({
    studentId: profileStudA.id,
    title: 'Full Stack Web Developer Intern',
    companyName: 'Acme Labs',
    startDate: dateOneYearAgo,
    isCurrent: true,
    description: 'Worked on Node.js and React full stack services',
  });

  // Assessment for Student A: Assessment on Node.js
  const assessNode = await SkillAssessment.create({
    title: `Node.js Assessment ${ts}`,
    skillId: skillNode.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 30,
    passingScore: 60,
    totalQuestions: 10,
    isActive: true,
  });

  await AssessmentAttempt.create({
    assessmentId: assessNode.id,
    studentId: profileStudA.id,
    startedAt: new Date(),
    completedAt: new Date(),
    score: 90,
    percentage: 90,
    status: AssessmentAttemptStatus.COMPLETED,
  });

  // 2. Student B (No skills, no experience, no career interests)
  const userStudB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Bob',
    lastName: 'Blank',
    email: `student.bob.${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudB = await StudentProfile.create({
    userId: userStudB.id,
    headline: 'New Student',
    collegeName: 'State College',
    department: 'Electrical Engineering',
    city: 'Pune',
    state: 'Maharashtra',
    availabilityStatus: 'NOT_AVAILABLE',
    profileCompletion: 20,
  });

  // 3. Industry A
  const userIndA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Nova',
    lastName: 'Tech',
    email: `industry.nova.${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileIndA = await IndustryProfile.create({
    userId: userIndA.id,
    companyName: `Nova Tech ${ts}`,
    industryType: 'Software',
    location: 'Bangalore, India',
    verified: true,
  });

  // 4. Industry B (Attacker / Unrelated)
  const userIndB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Zephyr',
    lastName: 'Corp',
    email: `industry.zephyr.${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileIndB = await IndustryProfile.create({
    userId: userIndB.id,
    companyName: `Zephyr Corp ${ts}`,
    industryType: 'Hardware',
    location: 'Delhi, India',
    verified: true,
  });

  // 5. Mentor User & Mentor Profile
  const userMentor = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Priya',
    lastName: 'Nair',
    email: `mentor.priya.${ts}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const mentorProfile = await Mentor.create({
    userId: userMentor.id,
    expertiseAreas: `${skillReact.name}, ${skillNode.name}, ${roleFullStack.title}, Web Architecture`,
    maxMentees: 5,
    currentMentees: 1,
    isAvailable: true,
  });

  // 6. Opportunities
  // Job 1: Owned by Industry A, requires Node.js and React, Full Stack, Bangalore, On-Site
  const jobFullStack = await Job.create({
    industryId: profileIndA.id,
    title: `Full Stack Developer ${ts}`,
    description: `Looking for a Full Stack Developer proficient in React ${ts} and Node.js ${ts}`,
    requirements: `Required skills: React ${ts}, Node.js ${ts}`,
    location: 'Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    workplaceType: WorkplaceType.ON_SITE,
    employmentType: EmploymentType.FULL_TIME,
    status: OpportunityStatus.OPEN,
    openings: 2,
  });

  // Job 2: Remote Job requiring Python and Docker
  const jobPython = await Job.create({
    industryId: profileIndA.id,
    title: `Data Engineer ${ts}`,
    description: `Data pipeline engineer utilizing Python ${ts} and Docker ${ts}`,
    requirements: `Python ${ts}, Docker ${ts}`,
    location: 'Remote',
    city: null,
    workplaceType: WorkplaceType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    status: OpportunityStatus.OPEN,
    openings: 1,
  });

  // Job 3: Zero skill requirements opportunity
  const jobNoSkills = await Job.create({
    industryId: profileIndA.id,
    title: `General Trainee ${ts}`,
    description: 'Entry level orientation role with no prior technical prerequisites required',
    requirements: 'Any bachelor degree',
    location: 'Bangalore',
    city: 'Bangalore',
    workplaceType: WorkplaceType.ON_SITE,
    employmentType: EmploymentType.FULL_TIME,
    status: OpportunityStatus.OPEN,
    openings: 5,
  });

  // ====================================================
  // TEST SUITE EXECUTION
  // ====================================================

  console.log('--- 1. Deterministic Weights & Normalization Verification ---');

  await test('Authoritative recommendation weights sum to exactly 1.00', async () => {
    const sum =
      MATCH_WEIGHTS.SKILL_MATCH +
      MATCH_WEIGHTS.CAREER_ALIGNMENT +
      MATCH_WEIGHTS.EXPERIENCE +
      MATCH_WEIGHTS.ASSESSMENT +
      MATCH_WEIGHTS.PREFERENCE;

    assert.strictEqual(MATCH_WEIGHTS.SKILL_MATCH, 0.50);
    assert.strictEqual(MATCH_WEIGHTS.CAREER_ALIGNMENT, 0.20);
    assert.strictEqual(MATCH_WEIGHTS.EXPERIENCE, 0.10);
    assert.strictEqual(MATCH_WEIGHTS.ASSESSMENT, 0.10);
    assert.strictEqual(MATCH_WEIGHTS.PREFERENCE, 0.10);
    assert.strictEqual(Number(sum.toFixed(2)), 1.00);
  });

  await test('Final score is bounded between 0.00 and 100.00', async () => {
    const matchA = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    assert.ok(matchA.matchScore >= 0 && matchA.matchScore <= 100);
    assert.ok(matchA.breakdown.skillMatch.score >= 0 && matchA.breakdown.skillMatch.score <= 100);
    assert.ok(matchA.breakdown.careerAlignment.score >= 0 && matchA.breakdown.careerAlignment.score <= 100);
    assert.ok(matchA.breakdown.experience.score >= 0 && matchA.breakdown.experience.score <= 100);
    assert.ok(matchA.breakdown.assessment.score >= 0 && matchA.breakdown.assessment.score <= 100);
    assert.ok(matchA.breakdown.preference.score >= 0 && matchA.breakdown.preference.score <= 100);
  });

  console.log('\n--- 2. Deterministic Matching Engine Tests ---');

  await test('100% Skill Overlap: Student A against Full Stack Job', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    assert.strictEqual(match.breakdown.skillMatch.score, 100.0);
    assert.strictEqual(match.breakdown.skillMatch.missingSkills.length, 0);
    assert.ok(match.breakdown.skillMatch.matchedSkills.length >= 2);
  });

  await test('Career Alignment: Priority 1 role match yields 100% career component', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    assert.strictEqual(match.breakdown.careerAlignment.score, 100.0);
  });

  await test('Experience Alignment: Relevant 12+ months experience yields 100%', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    assert.strictEqual(match.breakdown.experience.score, 100.0);
    assert.strictEqual(match.breakdown.experience.hasRelevantExperience, true);
  });

  await test('Assessment Alignment: Uses trusted assessment score (90%)', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    assert.strictEqual(match.breakdown.assessment.score, 90.0);
  });

  await test('Preference Alignment: City match + Available status yields 100%', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    assert.strictEqual(match.breakdown.preference.score, 100.0);
    assert.strictEqual(match.breakdown.preference.locationMatch, true);
  });

  await test('Mathematical correctness of final composite score for Student A', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', false);
    // 100*0.5 + 100*0.2 + 100*0.1 + 90*0.1 + 100*0.1 = 50 + 20 + 10 + 9 + 10 = 99.00
    assert.strictEqual(match.matchScore, 99.0);
  });

  await test('No Skill Overlap & Zero Profile: Student B matches low/zero', async () => {
    const match = await matchingService.calculateMatch(profileStudB.id, jobFullStack.id, 'JOB', false);
    assert.strictEqual(match.breakdown.skillMatch.score, 0.0);
    assert.strictEqual(match.breakdown.careerAlignment.score, 0.0);
    assert.strictEqual(match.breakdown.experience.score, 0.0);
    assert.strictEqual(match.breakdown.assessment.score, 0.0);
    // Preference: Pune vs Bangalore on-site (0) + NOT_AVAILABLE (0) = 0
    assert.strictEqual(match.breakdown.preference.score, 0.0);
    assert.strictEqual(match.matchScore, 0.0);
  });

  await test('Partial Skill Overlap: Student A against Python/Docker Job', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobPython.id, 'JOB', false);
    // Student A has neither Python nor Docker
    assert.strictEqual(match.breakdown.skillMatch.score, 0.0);
    // Preference: Remote job gives 50 points location + 50 points available = 100
    assert.strictEqual(match.breakdown.preference.score, 100.0);
    // General assessment attempt gives 90 * 0.70 = 63.00
    assert.strictEqual(match.breakdown.assessment.score, 63.0);
    // Final score reflects weights accurately
    assert.ok(match.matchScore > 0 && match.matchScore < 50);
  });

  await test('Zero Required Skills Opportunity: Handled gracefully without division by zero', async () => {
    const match = await matchingService.calculateMatch(profileStudA.id, jobNoSkills.id, 'JOB', false);
    assert.strictEqual(match.breakdown.skillMatch.score, 100.0);
    assert.strictEqual(match.breakdown.skillMatch.totalRequired, 0);
    assert.ok(match.matchScore > 0);
  });

  await test('Persistence of OpportunityMatch record', async () => {
    await matchingService.calculateMatch(profileStudA.id, jobFullStack.id, 'JOB', true);
    const persisted = await OpportunityMatch.findOne({
      where: {
        studentId: profileStudA.id,
        opportunityId: jobFullStack.id,
        opportunityType: 'JOB',
      },
    });
    assert.ok(persisted);
    assert.strictEqual(Number(persisted.matchScore), 99.0);
    assert.ok(persisted.breakdown);
  });

  console.log('\n--- 3. Recommendation Services Tests ---');

  await test('Student Opportunity Recommendations: Ranked deterministically DESC', async () => {
    const result = await recommendationService.recommendOpportunitiesForStudent(userStudA.id, {
      page: 1,
      limit: 10,
    });
    assert.ok(result.recommendations.length >= 2);
    // Highest match score first
    assert.ok(result.recommendations[0].matchScore >= result.recommendations[1].matchScore);
    assert.strictEqual(result.recommendations[0].opportunity.id, jobFullStack.id);
  });

  await test('Student Career Recommendations: Deterministic suitability score & persistence', async () => {
    const result = await recommendationService.recommendCareersForStudent(userStudA.id, {
      page: 1,
      limit: 10,
    });
    assert.ok(result.careerRecommendations.length >= 1);
    const top = result.careerRecommendations[0];
    assert.ok(top.matchScore > 50);
    assert.ok(top.reasoning);

    const saved = await CareerRecommendation.findOne({
      where: { studentId: profileStudA.id, careerRoleId: roleFullStack.id },
    });
    assert.ok(saved);
  });

  await test('Student Learning Recommendations: Driven by skill gaps', async () => {
    // Create an explicit skill gap for Student A on Docker
    await SkillGap.create({
      studentId: profileStudA.id,
      skillId: skillDocker.id,
      targetRoleId: roleFullStack.id,
      requiredLevel: StudentSkillLevel.INTERMEDIATE,
      requiredScore: 50,
      gapScore: 50,
      priority: SkillGapPriority.HIGH,
      status: SkillGapStatus.OPEN,
    });

    const result = await recommendationService.recommendLearningForStudent(userStudA.id, {
      page: 1,
      limit: 10,
    });
    assert.ok(result.learningRecommendations.length >= 1);
    const rec = result.learningRecommendations[0];
    assert.strictEqual(rec.skillId, skillDocker.id);
    assert.ok(rec.title.includes('Docker'));

    const saved = await LearningRecommendation.findOne({
      where: { studentId: profileStudA.id, skillId: skillDocker.id },
    });
    assert.ok(saved);
  });

  await test('Student Mentor Recommendations: Ranked by expertise overlap', async () => {
    const result = await recommendationService.recommendMentorsForStudent(userStudA.id, {
      page: 1,
      limit: 10,
    });
    assert.ok(result.mentors.length >= 1);
    const topMentor = result.mentors[0];
    assert.strictEqual(topMentor.mentor.id, mentorProfile.id);
    assert.ok(topMentor.relevanceScore > 50);
    assert.ok(topMentor.matchedAreas.length > 0);
  });

  await test('Industry Candidate Recommendations: Owner ranks candidates correctly', async () => {
    const result = await recommendationService.recommendCandidatesForIndustry(userIndA.id, {
      opportunityId: jobFullStack.id,
      opportunityType: 'JOB',
      page: 1,
      limit: 10,
    });
    assert.ok(result.candidates.length >= 2);
    // Student A (99%) ranks higher than Student B (0%)
    assert.strictEqual(result.candidates[0].candidate.id, profileStudA.id);
    assert.strictEqual(result.candidates[0].matchScore, 99.0);
    // Candidate privacy: passwordHash and private fields must not be present
    assert.strictEqual((result.candidates[0].candidate as any).passwordHash, undefined);
    assert.strictEqual((result.candidates[0].candidate as any).email, undefined);
  });

  console.log('\n--- 4. Security & IDOR Protection Tests ---');

  await test('CRITICAL SECURITY: Industry B cannot view candidates for Industry A opportunity', async () => {
    let errorCaught = false;
    try {
      await recommendationService.recommendCandidatesForIndustry(userIndB.id, {
        opportunityId: jobFullStack.id,
        opportunityType: 'JOB',
        page: 1,
        limit: 10,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.ok(
        err.name === 'AuthorizationError' ||
        err.message.includes('not authorized')
      );
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError when accessing unowned opportunity');
  });

  await test('CRITICAL SECURITY: Student A cannot view Student B match directly (IDOR Protection)', async () => {
    let errorCaught = false;
    try {
      await matchingService.getStudentMatches(
        userStudA.id,
        profileStudB.id,
        jobFullStack.id,
        'JOB'
      );
    } catch (err: any) {
      errorCaught = true;
      assert.ok(
        err.name === 'AuthorizationError' ||
        err.message.includes('not authorized')
      );
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError on IDOR attempt');
  });

  await test('CRITICAL SECURITY: Industry B cannot inspect match data for Industry A opportunity', async () => {
    let errorCaught = false;
    try {
      await matchingService.matchCandidateForIndustry(
        userIndB.id,
        jobFullStack.id,
        'JOB',
        profileStudA.id
      );
    } catch (err: any) {
      errorCaught = true;
      assert.ok(
        err.name === 'AuthorizationError' ||
        err.message.includes('not authorized')
      );
    }
    assert.strictEqual(errorCaught, true, 'Expected AuthorizationError when unowned industry inspects candidate match');
  });

  console.log('\n--- 5. Cleanup Test Entities ---');

  await test('Clean up all created test entities', async () => {
    await OpportunityMatch.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await CareerRecommendation.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await LearningRecommendation.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await SkillGap.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await AssessmentAttempt.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await SkillAssessment.destroy({ where: { id: assessNode.id } });
    await StudentExperience.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await StudentCareerInterest.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await StudentSkill.destroy({ where: { studentId: [profileStudA.id, profileStudB.id] } });
    await Job.destroy({ where: { id: [jobFullStack.id, jobPython.id, jobNoSkills.id] } });
    await Mentor.destroy({ where: { id: mentorProfile.id } });
    await IndustryProfile.destroy({ where: { id: [profileIndA.id, profileIndB.id] } });
    await StudentProfile.destroy({ where: { id: [profileStudA.id, profileStudB.id] } });
    await User.destroy({ where: { id: [userStudA.id, userStudB.id, userIndA.id, userIndB.id, userMentor.id] } });
    await CareerRoleSkill.destroy({ where: { careerRoleId: [roleFullStack.id, roleDataEngineer.id] } });
    await CareerRole.destroy({ where: { id: [roleFullStack.id, roleDataEngineer.id] } });
    await Skill.destroy({ where: { id: [skillNode.id, skillReact.id, skillPython.id, skillDocker.id] } });
  });

  console.log('\n================================================================');
  console.log(`PHASE 14 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`Phase 14 Tests Failed: ${failed} tests failed`);
  }
};

if (require.main === module) {
  runPhase14Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
