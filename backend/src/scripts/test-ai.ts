import assert from 'assert';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { SkillGap } from '../models/skill-gap.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Document } from '../models/document.model';
import { DocumentAccess } from '../models/document-access.model';
import { AIAnalysis } from '../models/ai-analysis.model';
import { UserRole } from '../constants/roles';
import {
  StudentSkillLevel,
  OpportunityStatus,
  OpportunityType,
  WorkplaceType,
  EmploymentType,
  SkillGapPriority,
  SkillGapStatus,
  DocumentAccessLevel,
} from '../constants/enums';
import { aiService } from '../services/ai.service';
import { AIProviderFactory } from '../services/ai/ai-provider.factory';
import { AIProvider, AICompletionOptions } from '../services/ai/ai-provider.interface';
import { OpenAIProvider } from '../services/ai/openai.provider';
import { GeminiProvider } from '../services/ai/gemini.provider';
import { AIDataSanitizer } from '../services/ai/ai-sanitizer';
import {
  resumeAnalysisOutputSchema,
  opportunityAnalysisOutputSchema,
  skillGapExplanationOutputSchema,
  careerCopilotOutputSchema,
  learningRoadmapOutputSchema,
} from '../validators/ai-output.validator';
import {
  analyzeResumeSchema,
  analyzeOpportunitySchema,
  skillGapParamsSchema,
  careerCopilotSchema,
  learningRoadmapSchema,
} from '../validators/ai-input.validator';
import { AIProviderError, AuthorizationError, NotFoundError, ValidationError } from '../errors/app.error';

/**
 * Mock AI Provider for testing
 */
class MockAIProvider implements AIProvider {
  public readonly name = 'mock-provider';
  public responseToReturn: string = '{}';
  public shouldFail: boolean = false;
  public failureError: Error = new AIProviderError('Mock AI Provider network timeout');
  public lastPrompt: string = '';
  public lastOptions?: AICompletionOptions;

  public async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    this.lastPrompt = prompt;
    this.lastOptions = options;

    if (this.shouldFail) {
      throw this.failureError;
    }

    return this.responseToReturn;
  }
}

export const runPhase16Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 16 AI INTEGRATION LAYER TESTS');
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

  // Setup test data
  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('SecurePassword123!', 10);

  // 1. Student A
  const studentUserA = await User.create({
    email: `ai_student_a_${timestamp}@test.com`,
    passwordHash,
    role: UserRole.STUDENT,
    firstName: 'Arjun',
    lastName: 'AI',
    isVerified: true,
  });

  const studentProfileA = await StudentProfile.create({
    userId: studentUserA.id,
    headline: 'Full Stack Enthusiast & React Developer',
    bio: 'Passionate about Node.js and TypeScript web applications',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    collegeName: 'National Engineering Institute',
    careerGoal: 'Full Stack Engineer',
  });

  // 2. Student B (for IDOR check)
  const studentUserB = await User.create({
    email: `ai_student_b_${timestamp}@test.com`,
    passwordHash,
    role: UserRole.STUDENT,
    firstName: 'Bhavna',
    lastName: 'AI',
    isVerified: true,
  });

  const studentProfileB = await StudentProfile.create({
    userId: studentUserB.id,
    headline: 'Data Science Researcher',
    department: 'Data Science',
    collegeName: 'State Tech University',
  });

  // 3. Institution Profile
  const institutionUser = await User.create({
    email: `ai_inst_${timestamp}@test.com`,
    passwordHash,
    role: UserRole.INSTITUTION,
    firstName: 'Campus',
    lastName: 'Dean',
    isVerified: true,
  });

  await InstitutionProfile.create({
    userId: institutionUser.id,
    institutionName: 'National Engineering Institute',
    institutionType: 'University',
    state: 'Karnataka',
    city: 'Bengaluru',
  });

  // 4. Industry Profile & Job
  const industryUser = await User.create({
    email: `ai_ind_${timestamp}@test.com`,
    passwordHash,
    role: UserRole.INDUSTRY,
    firstName: 'TechCorp',
    lastName: 'HR',
    isVerified: true,
  });

  const industryProfile = await IndustryProfile.create({
    userId: industryUser.id,
    companyName: `TechCorp AI ${timestamp}`,
    industryType: 'Information Technology',
    city: 'Bengaluru',
  });

  const job = await Job.create({
    industryId: industryProfile.id,
    title: 'Senior Backend Engineer',
    description: 'Design and build high-performance microservices and API gateways using Node.js, TypeScript, and MySQL.',
    requirements: 'Minimum 2 years experience with Node.js, REST APIs, Sequelize, and relational databases.',
    status: OpportunityStatus.OPEN,
    workplaceType: WorkplaceType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    location: 'Bengaluru',
    city: 'Bengaluru',
  });

  // 5. Skills & Skill Gap for Student A
  let category = await SkillCategory.findOne();
  if (!category) {
    category = await SkillCategory.create({
      name: `AI Engineering Track ${timestamp}`,
      description: 'Domain for AI engineering track',
    });
  }

  const skillNode = await Skill.create({
    name: `Node.js Backend ${timestamp}`,
    slug: `nodejs-backend-${timestamp}`,
    categoryId: category.id,
  });

  const skillCloud = await Skill.create({
    name: `Cloud DevOps ${timestamp}`,
    slug: `cloud-devops-${timestamp}`,
    categoryId: category.id,
  });

  await StudentSkill.create({
    studentId: studentProfileA.id,
    skillId: skillNode.id,
    level: StudentSkillLevel.INTERMEDIATE,
    score: 78,
  });

  const gap = await SkillGap.create({
    studentId: studentProfileA.id,
    skillId: skillCloud.id,
    currentLevel: StudentSkillLevel.BEGINNER,
    requiredLevel: StudentSkillLevel.ADVANCED,
    currentScore: 35,
    requiredScore: 80,
    gapScore: 45,
    priority: SkillGapPriority.HIGH,
    status: SkillGapStatus.OPEN,
  });

  // 6. Documents for Student A & B
  const docA = await Document.create({
    ownerUserId: studentUserA.id,
    fileName: 'Arjun_FullStack_Resume.pdf',
    fileUrl: 'https://storage.local/documents/arjun_resume.pdf',
    fileType: 'application/pdf',
    fileSizeBytes: 1048576,
    accessLevel: DocumentAccessLevel.PRIVATE,
  });

  const docB = await Document.create({
    ownerUserId: studentUserB.id,
    fileName: 'Bhavna_Confidential_Resume.pdf',
    fileUrl: 'https://storage.local/documents/bhavna_resume.pdf',
    fileType: 'application/pdf',
    fileSizeBytes: 2048576,
    accessLevel: DocumentAccessLevel.PRIVATE,
  });

  console.log('Test fixtures created successfully.\n');

  // =========================================================================
  // 1. DATA SANITIZER & PRIVACY TESTS
  // =========================================================================

  await test('Privacy & Sanitization: AIDataSanitizer strips passwords, JWTs, and hashes', async () => {
    const rawText = `Candidate Arjun (Email: arjun@test.com). Secret pass: Password123! and hash: $2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEF. JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.abcdef.`;
    const sanitized = AIDataSanitizer.sanitizeText(rawText);

    assert.ok(!sanitized.includes('Password123!'), 'Plaintext password must be redacted');
    assert.ok(!sanitized.includes('abcdefghijklmnopqrstuvwxyz0123456789ABCDEF'), 'Bcrypt hash must be redacted');
    assert.ok(!sanitized.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'), 'JWT token must be redacted');
    assert.ok(sanitized.includes('[REDACTED_PASSWORD]'), 'Password placeholder present');
    assert.ok(sanitized.includes('[REDACTED_TOKEN]'), 'Token placeholder present');
  });

  await test('Privacy & Sanitization: sanitizeStudentContext produces safe minimal payload', async () => {
    const context = AIDataSanitizer.sanitizeStudentContext({
      headline: 'Full Stack Dev',
      department: 'Computer Science',
      skills: [{ name: 'TypeScript', level: 'INTERMEDIATE', score: 85 }],
      gaps: [{ skillName: 'Kubernetes', priority: 'HIGH', gapScore: 40 }],
      targetRole: 'Platform Engineer',
    });

    assert.strictEqual(context.department, 'Computer Science');
    assert.strictEqual(context.targetRole, 'Platform Engineer');
    assert.strictEqual(context.skills.length, 1);
    assert.strictEqual(context.skills[0].name, 'TypeScript');
    assert.strictEqual(context.identifiedGaps.length, 1);
  });

  // =========================================================================
  // 2. PROVIDER ABSTRACTION & ERROR HANDLING TESTS
  // =========================================================================

  await test('Provider Abstraction: OpenAIProvider handles missing API key safely', async () => {
    const provider = new OpenAIProvider('');
    let threw = false;
    try {
      await provider.generateCompletion('test prompt');
    } catch (err: any) {
      threw = true;
      assert.ok(err instanceof AIProviderError);
      assert.ok(err.message.includes('API key is not configured'));
    }
    assert.ok(threw, 'Should throw AIProviderError when API key is missing');
  });

  await test('Provider Abstraction: GeminiProvider handles missing API key safely', async () => {
    const provider = new GeminiProvider('');
    let threw = false;
    try {
      await provider.generateCompletion('test prompt');
    } catch (err: any) {
      threw = true;
      assert.ok(err instanceof AIProviderError);
      assert.ok(err.message.includes('API key is not configured'));
    }
    assert.ok(threw, 'Should throw AIProviderError when API key is missing');
  });

  await test('Provider Abstraction: AIProviderFactory switches active provider correctly', async () => {
    AIProviderFactory.setProvider(mockProvider);
    const active = AIProviderFactory.getProvider();
    assert.strictEqual(active.name, 'mock-provider');
  });

  // =========================================================================
  // 3. ZOD OUTPUT VALIDATION TESTS
  // =========================================================================

  await test('Zod Output Validation: Validates correct AI JSON schemas', async () => {
    const validResume = {
      skills: ['Node.js', 'Express', 'MySQL'],
      experienceSummary: '2 years of practical backend development',
      strengths: ['Fast learner', 'Clean API design'],
      skillGaps: ['Docker', 'CI/CD pipelines'],
      careerRelevance: 'Strong alignment with Backend roles',
      improvementSuggestions: ['Add integration tests', 'Containerize services'],
    };
    const parsed = resumeAnalysisOutputSchema.parse(validResume);
    assert.strictEqual(parsed.skills.length, 3);
  });

  await test('Zod Output Validation: Rejects malformed or missing required AI fields', async () => {
    const invalidResume = {
      skills: 'Not an array',
      experienceSummary: 12345, // Not a string
    };
    assert.throws(() => {
      resumeAnalysisOutputSchema.parse(invalidResume);
    });
  });

  // =========================================================================
  // 4. ENDPOINT 1: POST /api/v1/ai/analyze-resume
  // =========================================================================

  await test('Endpoint 1 (Resume Analysis): Successfully analyzes raw resume text with AI', async () => {
    mockProvider.shouldFail = false;
    mockProvider.responseToReturn = JSON.stringify({
      skills: ['TypeScript', 'Express', 'Sequelize', 'PostgreSQL'],
      experienceSummary: 'Demonstrated experience in building robust backend services',
      strengths: ['API Architecture', 'Database Design'],
      skillGaps: ['Kubernetes', 'Microservices'],
      careerRelevance: 'High readiness for Junior/Mid Backend roles',
      improvementSuggestions: ['Deploy applications to AWS', 'Implement automated CI/CD'],
    });

    const result = await aiService.analyzeResume(studentUserA.id, {
      resumeText: 'Experienced with TypeScript, Express, Sequelize, and relational databases.',
    });

    assert.strictEqual(result.fallbackUsed, false);
    assert.strictEqual(result.provider, 'mock-provider');
    assert.strictEqual(result.analysis.skills.length, 4);
    assert.strictEqual(result.analysis.skills[0], 'TypeScript');

    // Verify sanitized persistence in AIAnalysis
    const saved = await AIAnalysis.findOne({
      where: { userId: studentUserA.id, analysisType: 'RESUME_ANALYSIS' },
      order: [['createdAt', 'DESC']],
    });
    assert.ok(saved, 'Resume analysis must be persisted in ai_analyses');
    assert.strictEqual(saved!.provider, 'mock-provider');
  });

  await test('Endpoint 1 (Resume Analysis): Deterministic fallback works when provider fails', async () => {
    mockProvider.shouldFail = true;

    const result = await aiService.analyzeResume(studentUserA.id, {
      resumeText: 'React, Node.js, SQL database query design and optimization.',
    });

    assert.strictEqual(result.fallbackUsed, true);
    assert.ok(result.analysis.skills.length > 0);
    assert.ok(result.analysis.experienceSummary.length > 0);
  });

  await test('Endpoint 1 (Resume Analysis Security): Rejects unauthorized access to private document (IDOR)', async () => {
    let threw = false;
    try {
      // Student A tries to analyze Student B's private resume
      await aiService.analyzeResume(studentUserA.id, {
        documentId: docB.id,
      });
    } catch (err: any) {
      threw = true;
      assert.ok(err instanceof AuthorizationError);
    }
    assert.ok(threw, 'Should block unauthorized document access');
  });

  // =========================================================================
  // 5. ENDPOINT 2: POST /api/v1/ai/analyze-opportunity
  // =========================================================================

  await test('Endpoint 2 (Opportunity Analysis): Successfully analyzes job requirements with AI', async () => {
    mockProvider.shouldFail = false;
    mockProvider.responseToReturn = JSON.stringify({
      roleSummary: 'Senior level backend engineering role focusing on high-throughput microservices',
      extractedSkills: ['Node.js', 'TypeScript', 'Sequelize', 'MySQL', 'API Design'],
      experienceLevel: 'Mid to Senior (2+ years)',
      keyResponsibilities: ['Architecting REST APIs', 'Optimizing database queries'],
      candidatePreparationTips: ['Brush up on relational indexing', 'Demonstrate clean MVC patterns'],
    });

    const result = await aiService.analyzeOpportunity(
      industryUser.id,
      {
        opportunityId: job.id,
        opportunityType: OpportunityType.JOB,
      },
      UserRole.INDUSTRY
    );

    assert.strictEqual(result.fallbackUsed, false);
    assert.strictEqual(result.analysis.extractedSkills.length, 5);
    assert.strictEqual(result.analysis.experienceLevel, 'Mid to Senior (2+ years)');
  });

  await test('Endpoint 2 (Opportunity Analysis): Deterministic fallback works on provider failure', async () => {
    mockProvider.shouldFail = true;

    const result = await aiService.analyzeOpportunity(
      studentUserA.id,
      {
        opportunityId: job.id,
        opportunityType: OpportunityType.JOB,
      },
      UserRole.STUDENT
    );

    assert.strictEqual(result.fallbackUsed, true);
    assert.ok(result.analysis.extractedSkills.length > 0);
    assert.ok(result.analysis.candidatePreparationTips.length > 0);
  });

  await test('Endpoint 2 (Opportunity Analysis): Rejects non-existent opportunity', async () => {
    let threw = false;
    try {
      await aiService.analyzeOpportunity(
        studentUserA.id,
        {
          opportunityId: 999999,
          opportunityType: OpportunityType.JOB,
        },
        UserRole.STUDENT
      );
    } catch (err: any) {
      threw = true;
      assert.ok(err instanceof NotFoundError);
    }
    assert.ok(threw, 'Should throw NotFoundError for non-existent opportunity');
  });

  // =========================================================================
  // 6. ENDPOINT 3: GET /api/v1/ai/skill-gap/:studentId
  // =========================================================================

  await test('Endpoint 3 (Skill Gap AI Assistance): Returns AI explanations with deterministic gap metrics', async () => {
    mockProvider.shouldFail = false;
    mockProvider.responseToReturn = JSON.stringify({
      explanations: [
        {
          skillName: skillCloud.name,
          importanceReason: 'Modern cloud infrastructure is essential for production deployments',
          learningSuggestions: ['Complete AWS Cloud Practitioner', 'Dockerize sample backend projects'],
        },
      ],
      overallRecommendation: 'Prioritize containerization and cloud basics before complex distributed systems.',
    });

    const result = await aiService.getSkillGapAssistance(studentProfileA.id, {
      id: studentUserA.id,
      role: UserRole.STUDENT,
    });

    assert.strictEqual(result.fallbackUsed, false);
    assert.strictEqual(result.studentId, studentProfileA.id);
    assert.strictEqual(result.identifiedGaps.length, 1);
    // Crucial check: Authoritative gap values remain deterministic
    assert.strictEqual(result.identifiedGaps[0].currentLevel, StudentSkillLevel.BEGINNER);
    assert.strictEqual(result.identifiedGaps[0].requiredLevel, StudentSkillLevel.ADVANCED);
    assert.strictEqual(result.identifiedGaps[0].gapScore, 45);
    assert.strictEqual(result.aiExplanations.length, 1);
  });

  await test('Endpoint 3 (Skill Gap Security / IDOR): Student A cannot access Student B skill gaps', async () => {
    let threw = false;
    try {
      // Student A tries to view Student B's skill gaps
      await aiService.getSkillGapAssistance(studentProfileB.id, {
        id: studentUserA.id,
        role: UserRole.STUDENT,
      });
    } catch (err: any) {
      threw = true;
      assert.ok(err instanceof AuthorizationError);
    }
    assert.ok(threw, 'Should reject Student A from accessing Student B data');
  });

  await test('Endpoint 3 (Skill Gap Fallback): Deterministic fallback preserves all authoritative gap data', async () => {
    mockProvider.shouldFail = true;

    const result = await aiService.getSkillGapAssistance(studentProfileA.id, {
      id: studentUserA.id,
      role: UserRole.STUDENT,
    });

    assert.strictEqual(result.fallbackUsed, true);
    assert.strictEqual(result.identifiedGaps[0].gapScore, 45);
    assert.ok(result.aiExplanations.length > 0);
    assert.ok(result.overallRecommendation.includes('high-priority skill gaps first'));
  });

  // =========================================================================
  // 7. ENDPOINT 4: POST /api/v1/ai/career-copilot
  // =========================================================================

  await test('Endpoint 4 (Career Copilot): Provides contextual advice for student queries', async () => {
    mockProvider.shouldFail = false;
    mockProvider.responseToReturn = JSON.stringify({
      reply: 'To become a Full Stack Engineer, focus on strengthening your React state management and building complete REST APIs.',
      suggestedActions: [
        'Build a full-stack CRUD application with authentication',
        'Take the intermediate TypeScript assessment',
      ],
      relevantSkills: ['TypeScript', 'Express', 'React'],
    });

    const result = await aiService.getCareerCopilot(studentUserA.id, {
      message: 'How can I prepare for junior software engineering interviews?',
    });

    assert.strictEqual(result.fallbackUsed, false);
    assert.ok(result.response.reply.includes('Full Stack Engineer'));
    assert.strictEqual(result.response.suggestedActions.length, 2);
  });

  await test('Endpoint 4 (Career Copilot Fallback): Deterministic recommendation fallback works when provider fails', async () => {
    mockProvider.shouldFail = true;

    const result = await aiService.getCareerCopilot(studentUserA.id, {
      message: 'What skills should I learn next?',
    });

    assert.strictEqual(result.fallbackUsed, true);
    assert.ok(result.response.reply.length > 0);
    assert.ok(result.response.suggestedActions.length > 0);
  });

  // =========================================================================
  // 8. ENDPOINT 5: POST /api/v1/ai/learning-roadmap
  // =========================================================================

  await test('Endpoint 5 (Learning Roadmap): Generates structured week-by-week curriculum with AI', async () => {
    mockProvider.shouldFail = false;
    mockProvider.responseToReturn = JSON.stringify({
      targetRole: 'Backend Systems Architect',
      totalDurationWeeks: 4,
      milestones: [
        {
          weekNumber: 1,
          topic: 'Advanced Node.js Internals & Event Loop',
          skillsCovered: ['Node.js', 'libuv'],
          learningResources: ['Node.js Official Documentation'],
          projectIdea: 'Build a custom thread pool monitor',
        },
        {
          weekNumber: 2,
          topic: 'Relational Database Optimization & Indexing',
          skillsCovered: ['MySQL', 'Indexing'],
          learningResources: ['High Performance MySQL Guide'],
          projectIdea: 'Benchmark query plans on a 1M record table',
        },
      ],
      recommendedCourses: [
        { title: 'Scalable Microservices', provider: 'Platform Partner', priority: 'HIGH' },
      ],
    });

    const result = await aiService.generateLearningRoadmap(studentUserA.id, {
      targetRole: 'Backend Systems Architect',
      timeframeWeeks: 4,
    });

    assert.strictEqual(result.fallbackUsed, false);
    assert.strictEqual(result.roadmap.totalDurationWeeks, 4);
    assert.strictEqual(result.roadmap.milestones.length, 2);
  });

  await test('Endpoint 5 (Learning Roadmap Fallback): Generates deterministic roadmap on provider failure', async () => {
    mockProvider.shouldFail = true;

    const result = await aiService.generateLearningRoadmap(studentUserA.id, {
      targetRole: 'Cloud Solutions Architect',
      timeframeWeeks: 6,
    });

    assert.strictEqual(result.fallbackUsed, true);
    assert.strictEqual(result.roadmap.totalDurationWeeks, 6);
    assert.strictEqual(result.roadmap.milestones.length, 6);
    assert.ok(result.roadmap.milestones[0].topic.includes('Mastering'));
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`PHASE 16 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runPhase16Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error running Phase 16 tests:', err);
      process.exit(1);
    });
}
