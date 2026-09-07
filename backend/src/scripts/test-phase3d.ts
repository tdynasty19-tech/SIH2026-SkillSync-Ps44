import assert from 'assert';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { Skill } from '../models/skill.model';
import { CareerRole } from '../models/career-role.model';
import { Job } from '../models/job.model';
import { aiService } from '../services/ai.service';
import { recommendationService } from '../services/recommendation.service';
import { AIProviderFactory } from '../services/ai/ai-provider.factory';
import { MockAIProvider } from '../services/ai/mock.provider';
import { UserRole } from '../constants/roles';
import { OpportunityType, StudentSkillLevel, WorkplaceType, EmploymentType, OpportunityStatus } from '../constants/enums';

export const runPhase3DTests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 3D AI + CAREER + LEARNING INTELLIGENCE TESTS');
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

  const mockProvider = new MockAIProvider();
  AIProviderFactory.setProvider(mockProvider);

  // Find demo student user
  const studentUser = await User.findOne({ where: { role: UserRole.STUDENT } });
  assert.ok(studentUser, 'Demo student user should exist in database');

  const studentProfile = await StudentProfile.findOne({ where: { userId: studentUser.id } });
  assert.ok(studentProfile, 'Demo student profile should exist');

  // Find demo opportunity
  const demoJob = await Job.findOne();
  assert.ok(demoJob, 'Demo job should exist');

  // Test 1: Career Recommendations (Section 7)
  await test('Career Recommendations: Returns readiness, whyItFits, strongSkills, skillGaps, and nextSteps', async () => {
    const result = await recommendationService.recommendCareersForStudent(studentUser.id, { page: 1, limit: 5 });
    assert.ok(result.careerRecommendations, 'Should return career recommendations array');
    assert.ok(result.careerRecommendations.length > 0, 'Should have at least 1 career recommendation');

    const topRec = result.careerRecommendations[0] as any;
    assert.ok(topRec.careerRole, 'Must have careerRole');
    assert.strictEqual(typeof topRec.readiness, 'number', 'Readiness score must be a number');
    assert.strictEqual(typeof topRec.whyItFits, 'string', 'whyItFits must be an explanatory string');
    assert.ok(Array.isArray(topRec.strongSkills), 'strongSkills must be an array');
    assert.ok(Array.isArray(topRec.skillGaps), 'skillGaps must be an array');
    assert.ok(Array.isArray(topRec.recommendedNextSteps), 'recommendedNextSteps must be an array');
    assert.ok(topRec.recommendedNextSteps.length >= 2, 'Must have actionable next steps');
  });

  // Test 2: AI Opportunity Explanation (Section 11) - Deterministic Fallback
  await test('AI Opportunity Explanation: Deterministic fallback preserves 5-factor score', async () => {
    mockProvider.shouldFail = true;

    const result = await aiService.explainOpportunityMatch(studentUser.id, demoJob.id, 'JOB');
    assert.ok(result.explanation, 'Must return explanation object');
    assert.strictEqual(result.fallbackUsed, true, 'Fallback should be activated when provider fails');
    assert.strictEqual(typeof result.explanation.matchScore, 'number', 'matchScore must be preserved');
    assert.strictEqual(typeof result.explanation.suitabilitySummary, 'string', 'Must provide suitability summary');
    assert.ok(Array.isArray(result.explanation.strengths), 'strengths must be array');
    assert.ok(Array.isArray(result.explanation.areasToImprove), 'areasToImprove must be array');
    assert.strictEqual(typeof result.explanation.recommendation, 'string', 'Must provide recommendation');
  });

  // Test 3: AI Opportunity Explanation - AI Success
  await test('AI Opportunity Explanation: Validates structured output on AI success', async () => {
    mockProvider.shouldFail = false;
    mockProvider.responseToReturn = JSON.stringify({
      matchScore: 82,
      suitabilitySummary: 'Candidate is an outstanding match for this backend position.',
      strengths: ['Strong Java skills', 'Strong SQL background', 'Assessment verified'],
      areasToImprove: ['Gain familiarity with Spring Boot', 'Explore Docker deployment'],
      recommendation: 'You are a strong candidate and should consider applying.',
      matchedSkills: ['Java', 'SQL'],
      missingSkills: ['Spring Boot'],
    });

    const result = await aiService.explainOpportunityMatch(studentUser.id, demoJob.id, 'JOB');
    assert.ok(result.explanation);
    assert.strictEqual(result.fallbackUsed, false, 'Should be AI output when provider succeeds');
    assert.ok(result.explanation.strengths.length > 0);
    assert.ok(result.explanation.areasToImprove.length > 0);
  });

  // Test 4: AI Skill Gap Assistance & Recommended Order (Section 8)
  await test('AI Skill Gap Assistance: Returns recommendedOrder and supports self-service student lookup', async () => {
    mockProvider.shouldFail = true; // test deterministic fallback

    const result = await aiService.getSkillGapAssistance(undefined, {
      id: studentUser.id,
      role: UserRole.STUDENT,
    });

    assert.ok(result.identifiedGaps, 'Must return identified gaps');
    assert.ok(Array.isArray(result.aiExplanations), 'Must return explanations');
    assert.ok(Array.isArray(result.recommendedOrder), 'Must return recommendedOrder array');
    assert.strictEqual(result.fallbackUsed, true);
  });

  // Test 5: Personalized Learning Roadmap (Section 9 & 10)
  await test('Learning Roadmap: Generates week-by-week milestones and recommended courses', async () => {
    mockProvider.shouldFail = true; // test deterministic fallback

    const result = await aiService.generateLearningRoadmap(studentUser.id, {
      targetRole: 'Java Backend Developer',
      timeframeWeeks: 4,
    });

    assert.ok(result.roadmap);
    assert.strictEqual(result.roadmap.totalDurationWeeks, 4);
    assert.strictEqual(result.roadmap.milestones.length, 4);
    assert.ok(result.roadmap.milestones[0].weekNumber === 1);
    assert.ok(result.roadmap.milestones[0].topic);
    assert.ok(result.roadmap.milestones[0].projectIdea);
    assert.ok(result.roadmap.recommendedCourses.length > 0);
  });

  // Test 6: AI Career Copilot Intent Recognition (Section 6)
  await test('AI Career Copilot: Answers questions about careers, gaps, learning, and internships', async () => {
    mockProvider.shouldFail = true; // test rich deterministic fallback

    const careerQuery = await aiService.getCareerCopilot(studentUser.id, {
      message: 'What career should I target based on my current skills?',
    });
    assert.ok(careerQuery.response.reply.length > 0);
    assert.ok(careerQuery.response.suggestedActions.length > 0);

    const learnQuery = await aiService.getCareerCopilot(studentUser.id, {
      message: 'What should I learn next for the next 30 days?',
    });
    assert.ok(learnQuery.response.reply.includes('Week'));
    assert.ok(learnQuery.response.suggestedActions.length > 0);

    const matchQuery = await aiService.getCareerCopilot(studentUser.id, {
      message: 'Which internship should I apply for?',
    });
    assert.ok(matchQuery.response.reply.toLowerCase().includes('internship'));
  });

  // Test 7: Missing API Key Handling (Section 14)
  await test('Security & Reliability: Missing API key does not crash and activates fallback', async () => {
    mockProvider.shouldFail = true;
    mockProvider.failureError = new Error('API key not configured');

    const result = await aiService.getCareerCopilot(studentUser.id, {
      message: 'Hello copilot',
    });
    assert.strictEqual(result.fallbackUsed, true);
    assert.ok(result.response.reply.length > 0);
  });

  console.log('\n================================================================');
  console.log(`PHASE 3D TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase3DTests().catch((err) => {
  console.error('Fatal error running Phase 3D tests:', err);
  process.exit(1);
});
