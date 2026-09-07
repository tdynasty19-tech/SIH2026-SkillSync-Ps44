import { AIProviderFactory } from './ai/ai-provider.factory';
import { AIDataSanitizer } from './ai/ai-sanitizer';
import { aiRepository, AIRepository } from '../repositories/ai.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { applicationRepository, ApplicationRepository } from '../repositories/application.repository';
import { documentRepository, DocumentRepository } from '../repositories/document.repository';
import { skillGapRepository, SkillGapRepository } from '../repositories/skill-gap.repository';
import { careerRepository, CareerRepository } from '../repositories/career.repository';
import { institutionRepository, InstitutionRepository } from '../repositories/institution.repository';
import { industryRepository, IndustryRepository } from '../repositories/industry.repository';
import { skillGapService, SkillGapService } from './skill-gap.service';
import { recommendationService, RecommendationService } from './recommendation.service';
import { matchingService, MatchingService } from './matching.service';
import { LearningProgram } from '../models/learning-program.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import {
  resumeAnalysisOutputSchema,
  opportunityAnalysisOutputSchema,
  skillGapExplanationOutputSchema,
  careerCopilotOutputSchema,
  learningRoadmapOutputSchema,
  opportunityExplanationOutputSchema,
  ResumeAnalysisOutput,
  OpportunityAnalysisOutput,
  SkillGapExplanationOutput,
  CareerCopilotOutput,
  LearningRoadmapOutput,
  OpportunityExplanationOutput,
} from '../validators/ai-output.validator';
import {
  AnalyzeResumeInput,
  AnalyzeOpportunityInput,
  CareerCopilotInput,
  LearningRoadmapInput,
} from '../validators/ai-input.validator';
import { NotFoundError, AuthorizationError, ValidationError, AIProviderError } from '../errors/app.error';
import { UserRole } from '../constants/roles';
import { OpportunityType, SkillGapStatus, StudentSkillLevel, OpportunityStatus } from '../constants/enums';

export class AIService {
  constructor(
    private readonly aiRepo: AIRepository = aiRepository,
    private readonly studentRepo: StudentRepository = studentRepository,
    private readonly appRepo: ApplicationRepository = applicationRepository,
    private readonly docRepo: DocumentRepository = documentRepository,
    private readonly skillGapRepo: SkillGapRepository = skillGapRepository,
    private readonly careerRepo: CareerRepository = careerRepository,
    private readonly institutionRepo: InstitutionRepository = institutionRepository,
    private readonly industryRepo: IndustryRepository = industryRepository,
    private readonly skillGapServ: SkillGapService = skillGapService,
    private readonly recServ: RecommendationService = recommendationService,
    private readonly matchingServ: MatchingService = matchingService
  ) {}

  // ====================================================
  // 1. RESUME ANALYSIS
  // ====================================================

  public async analyzeResume(
    userId: number,
    input: AnalyzeResumeInput
  ): Promise<{ analysis: ResumeAnalysisOutput; fallbackUsed: boolean; provider: string }> {
    let rawResumeText = input.resumeText?.trim() || '';

    // If documentId specified, verify authorization and read content
    if (input.documentId) {
      const doc = await this.docRepo.findDocumentById(input.documentId);
      if (!doc) {
        throw new NotFoundError(`Document not found for ID: ${input.documentId}`);
      }

      // Check ownership or granted access
      const isOwner = doc.ownerUserId === userId;
      const accessGrants = (doc as any).accessGrants || [];
      const hasAccess = accessGrants.some((ag: any) => ag.granteeUserId === userId);
      if (!isOwner && !hasAccess) {
        throw new AuthorizationError('You do not have permission to access this document');
      }

      if (!rawResumeText) {
        rawResumeText = doc.fileName || '';
      }
    }

    // If still empty, fall back to student's profile headline and bio
    if (!rawResumeText) {
      const student = await this.studentRepo.findProfileByUserId(userId);
      if (student) {
        rawResumeText = [student.headline, student.bio, student.department, student.course]
          .filter(Boolean)
          .join(' ');
      }
    }

    if (!rawResumeText || rawResumeText.trim().length === 0) {
      throw new ValidationError('Resume content is required for analysis');
    }

    const sanitizedText = AIDataSanitizer.sanitizeText(rawResumeText, 10000);
    const provider = AIProviderFactory.getProvider();

    const systemPrompt = `You are a technical resume evaluator and skill intelligence analyzer. You output strictly valid JSON conforming to the requested schema. Return an object with keys:
- skills: array of string
- experienceSummary: string
- strengths: array of string
- skillGaps: array of string
- careerRelevance: string
- improvementSuggestions: array of string
Do not wrap your response in markdown fences or include explanations outside the JSON.`;

    const userPrompt = `Analyze the following sanitized resume content:\n${sanitizedText}`;

    try {
      const rawOutput = await provider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.2,
      });

      const parsed = this.parseJsonSafe(rawOutput);
      const validated = resumeAnalysisOutputSchema.parse(parsed);

      // Persist advisory analysis
      await this.aiRepo.createAnalysis({
        userId,
        analysisType: 'RESUME_ANALYSIS',
        provider: provider.name,
        inputData: { length: sanitizedText.length },
        outputData: validated,
      });

      return {
        analysis: validated,
        fallbackUsed: false,
        provider: provider.name,
      };
    } catch (err: any) {
      // Deterministic fallback if AI provider fails
      const fallback = this.getDeterministicResumeAnalysisFallback(sanitizedText);

      await this.aiRepo.createAnalysis({
        userId,
        analysisType: 'RESUME_ANALYSIS',
        provider: `${provider.name}-fallback`,
        inputData: { length: sanitizedText.length },
        outputData: fallback,
      });

      return {
        analysis: fallback,
        fallbackUsed: true,
        provider: provider.name,
      };
    }
  }

  // ====================================================
  // 2. OPPORTUNITY ANALYSIS
  // ====================================================

  public async analyzeOpportunity(
    userId: number,
    input: AnalyzeOpportunityInput,
    userRole: string
  ): Promise<{ analysis: OpportunityAnalysisOutput; fallbackUsed: boolean; provider: string }> {
    const opp = await this.appRepo.findOpportunity(input.opportunityType, input.opportunityId);
    if (!opp) {
      throw new NotFoundError(
        `Opportunity not found for type ${input.opportunityType} and ID ${input.opportunityId}`
      );
    }

    const oppData = (opp as any).dataValues || opp;
    const sanitizedContext = AIDataSanitizer.sanitizeOpportunityContext({
      title: oppData.title,
      description: input.customDescription || oppData.description,
      requirements: oppData.requirements,
      workplaceType: oppData.workplaceType,
      employmentType: oppData.employmentType,
    });

    const provider = AIProviderFactory.getProvider();

    const systemPrompt = `You are an industry talent evaluator and opportunity requirement analyst. Output strictly valid JSON conforming to the schema with keys:
- roleSummary: string
- extractedSkills: array of string
- experienceLevel: string
- keyResponsibilities: array of string
- candidatePreparationTips: array of string
Do not wrap your response in markdown fences or include explanations outside the JSON.`;

    const userPrompt = `Analyze the following opportunity requirements:\nTitle: ${sanitizedContext.title}\nRequirements: ${sanitizedContext.requirements || 'None provided'}\nDescription: ${sanitizedContext.description}`;

    try {
      const rawOutput = await provider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.2,
      });

      const parsed = this.parseJsonSafe(rawOutput);
      const validated = opportunityAnalysisOutputSchema.parse(parsed);

      await this.aiRepo.createAnalysis({
        userId,
        analysisType: 'OPPORTUNITY_ANALYSIS',
        provider: provider.name,
        inputData: { opportunityId: input.opportunityId, opportunityType: input.opportunityType },
        outputData: validated,
      });

      return {
        analysis: validated,
        fallbackUsed: false,
        provider: provider.name,
      };
    } catch (err: any) {
      const fallback = this.getDeterministicOpportunityAnalysisFallback(sanitizedContext);

      await this.aiRepo.createAnalysis({
        userId,
        analysisType: 'OPPORTUNITY_ANALYSIS',
        provider: `${provider.name}-fallback`,
        inputData: { opportunityId: input.opportunityId, opportunityType: input.opportunityType },
        outputData: fallback,
      });

      return {
        analysis: fallback,
        fallbackUsed: true,
        provider: provider.name,
      };
    }
  }

  // ====================================================
  // 3. STUDENT SKILL-GAP AI ASSISTANCE
  // ====================================================

  public async getSkillGapAssistance(
    studentId: number | undefined,
    requestingUser: { id: number; role: string }
  ): Promise<{
    studentId: number;
    identifiedGaps: any[];
    aiExplanations: any[];
    recommendedOrder: string[];
    overallRecommendation: string;
    fallbackUsed: boolean;
    provider: string;
  }> {
    let resolvedStudentId = studentId;

    // Role-based Access Control & IDOR Prevention
    if (requestingUser.role === UserRole.STUDENT) {
      const authStudent = await this.studentRepo.findProfileByUserId(requestingUser.id);
      if (!authStudent) {
        throw new NotFoundError('Student profile not found. Please complete your profile first.');
      }
      if (!resolvedStudentId || resolvedStudentId === authStudent.id) {
        resolvedStudentId = authStudent.id;
      } else {
        throw new AuthorizationError('You can only access your own skill gap analysis');
      }
    } else if (requestingUser.role === UserRole.INSTITUTION) {
      if (!resolvedStudentId) {
        throw new ValidationError('Student ID is required for institutional skill gap lookup');
      }
      const student = await this.studentRepo.findProfileById(resolvedStudentId);
      if (!student) {
        throw new NotFoundError(`Student profile not found for ID: ${resolvedStudentId}`);
      }
      const institution = await this.institutionRepo.findProfileByUserId(requestingUser.id);
      const verifiedAffiliation = institution
        ? await StudentInstitutionAffiliation.findOne({
            where: {
              studentId: student.id,
              institutionId: institution.id,
              status: 'VERIFIED',
            },
            attributes: ['id'],
          })
        : null;
      if (!verifiedAffiliation) {
        throw new AuthorizationError('You can only access skill gaps for students in your institution');
      }
    } else {
      throw new AuthorizationError('Unauthorized to view student skill gap assistance');
    }

    const student = await this.studentRepo.findProfileById(resolvedStudentId);
    if (!student) {
      throw new NotFoundError(`Student profile not found for ID: ${resolvedStudentId}`);
    }

    // Fetch authoritative deterministic skill gaps
    const gapsResult = await this.skillGapRepo.getStudentGaps(resolvedStudentId, undefined, undefined, 20, 0);
    let gaps = gapsResult.rows || [];
    if (gaps.length === 0) {
      gaps = (await this.skillGapServ.calculateGapsForStudent(resolvedStudentId).catch(() => [])) as any;
    }

    const identifiedGaps = gaps.map((g: any) => ({
      skillId: g.skillId,
      skillName: g.skill?.name || `Skill #${g.skillId}`,
      currentLevel: g.currentLevel,
      requiredLevel: g.requiredLevel,
      gapScore: Number(g.gapScore),
      priority: g.priority,
      status: g.status,
    }));

    if (identifiedGaps.length === 0) {
      return {
        studentId: resolvedStudentId,
        identifiedGaps: [],
        aiExplanations: [],
        recommendedOrder: [],
        overallRecommendation: 'No critical skill gaps identified. Keep up your active learning!',
        fallbackUsed: true,
        provider: 'deterministic-rules',
      };
    }

    const deterministicOrder = [...identifiedGaps]
      .sort((a, b) => b.gapScore - a.gapScore)
      .map((g) => g.skillName);

    const provider = AIProviderFactory.getProvider();

    const systemPrompt = `You are an educational counselor and skill-gap mentor. Output strictly valid JSON conforming to the schema with keys:
- explanations: array of { skillName: string, importanceReason: string, learningSuggestions: string[] }
- recommendedOrder: array of string (skills arranged in logical sequence to learn first)
- overallRecommendation: string
Do not wrap your response in markdown fences or include explanations outside the JSON.`;

    const userPrompt = `Provide strategic explanations, recommended learning sequence, and suggestions for these identified student skill gaps:\n${JSON.stringify(
      identifiedGaps.map((g) => ({ skill: g.skillName, requiredLevel: g.requiredLevel, priority: g.priority }))
    )}`;

    try {
      const rawOutput = await provider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.3,
      });

      const parsed = this.parseJsonSafe(rawOutput);
      const validated: SkillGapExplanationOutput = skillGapExplanationOutputSchema.parse(parsed);

      return {
        studentId: resolvedStudentId,
        identifiedGaps,
        aiExplanations: validated.explanations,
        recommendedOrder:
          validated.recommendedOrder && validated.recommendedOrder.length > 0
            ? validated.recommendedOrder
            : deterministicOrder,
        overallRecommendation: validated.overallRecommendation,
        fallbackUsed: false,
        provider: provider.name,
      };
    } catch (err: any) {
      // Deterministic fallback using rule-based explanations
      const fallbackExplanations = identifiedGaps.map((g) => ({
        skillName: g.skillName,
        importanceReason: `Required at ${g.requiredLevel} level with ${g.priority} priority for career readiness.`,
        learningSuggestions: [
          `Review core concepts and documentation for ${g.skillName}.`,
          `Complete hands-on laboratory exercises and sample mini-projects.`,
          `Attempt the platform skill assessment once practice exercises are completed.`,
        ],
      }));

      return {
        studentId: resolvedStudentId,
        identifiedGaps,
        aiExplanations: fallbackExplanations,
        recommendedOrder: deterministicOrder,
        overallRecommendation: `Address your ${identifiedGaps.filter((g) => g.priority === 'HIGH' || g.priority === 'CRITICAL').length} high-priority skill gaps first in recommended order (${deterministicOrder.slice(0, 3).join(' → ')}) to maximize employment readiness.`,
        fallbackUsed: true,
        provider: provider.name,
      };
    }
  }

  // ====================================================
  // 4. CAREER COPILOT
  // ====================================================

  public async getCareerCopilot(
    userId: number,
    input: CareerCopilotInput
  ): Promise<{ response: CareerCopilotOutput; fallbackUsed: boolean; provider: string }> {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your profile first.');
    }

    const studentId = student.id;

    // Retrieve sanitized student context
    const [skillsData, careerInterests, gapsData] = await Promise.all([
      this.studentRepo.getSkillsList(studentId, 50, 0),
      this.careerRepo.getStudentCareerInterests(studentId),
      this.skillGapRepo.getStudentGaps(studentId, undefined, undefined, 5, 0),
    ]);

    const sanitizedContext = AIDataSanitizer.sanitizeStudentContext({
      headline: student.headline,
      department: student.department,
      course: student.course,
      skills: (skillsData?.rows || []).map((s: any) => ({
        name: s.skill?.name || 'Skill',
        level: s.level,
        score: s.score,
      })),
      gaps: (gapsData.rows || []).map((g: any) => ({
        skillName: g.skill?.name || 'Skill',
        priority: g.priority,
        gapScore: Number(g.gapScore),
      })),
      targetRole: (careerInterests?.[0] as any)?.careerRole?.title || student.careerGoal,
    });

    const sanitizedMessage = AIDataSanitizer.sanitizeText(input.message, 2000);
    const provider = AIProviderFactory.getProvider();

    const systemPrompt = `You are the Career Copilot AI for a technical student platform. Output strictly valid JSON conforming to the schema with keys:
- reply: string (empathetic, actionable career advice)
- suggestedActions: array of string
- relevantSkills: array of string
Do not wrap your response in markdown fences or include explanations outside the JSON.`;

    const userPrompt = `Student Context:
Department: ${sanitizedContext.department || 'Computer Science'}
Target Career: ${sanitizedContext.targetRole || 'Software Engineering'}
Skills: ${sanitizedContext.skills.map((s) => `${s.name} (${s.level})`).join(', ') || 'None listed'}
Skill Gaps: ${sanitizedContext.identifiedGaps.map((g) => g.skillName).join(', ') || 'None'}

Student Question: "${sanitizedMessage}"`;

    try {
      const rawOutput = await provider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.3,
      });

      const parsed = this.parseJsonSafe(rawOutput);
      const validated = careerCopilotOutputSchema.parse(parsed);

      return {
        response: validated,
        fallbackUsed: false,
        provider: provider.name,
      };
    } catch (err: any) {
      // Deterministic Career Copilot Fallback using Phase 14 recommendations + profile context
      const careerRecs = await this.recServ
        .recommendCareersForStudent(userId, { page: 1, limit: 3 })
        .catch(() => ({ careerRecommendations: [] }));

      const topRec = (careerRecs as any).careerRecommendations?.[0];
      const lowerMsg = sanitizedMessage.toLowerCase();

      let fallbackReply = '';
      const suggestedActions: string[] = [];
      const relevantSkills: string[] = sanitizedContext.skills.slice(0, 5).map((s) => s.name);

      if (lowerMsg.includes('career') || lowerMsg.includes('target') || lowerMsg.includes('suit') || lowerMsg.includes('role')) {
        fallbackReply = topRec
          ? `Based on your verified skills and academic background, your strongest career match is **${topRec.careerRole?.title || 'Software Specialist'}** with a **${Math.round(topRec.matchScore)}%** readiness score. You already demonstrate strength in ${topRec.reasoning?.matchedSkills?.slice(0, 3).join(', ') || 'foundational areas'}.`
          : `Based on your profile in ${sanitizedContext.department || 'Engineering'}, roles in ${sanitizedContext.targetRole || 'Software Engineering'} suit your skill profile. Take verified assessments to increase your quantified readiness.`;
        suggestedActions.push(
          'View detailed career recommendations and roadmap',
          'Explore internships matching your target role',
          'Attempt domain assessment to raise readiness score'
        );
      } else if (lowerMsg.includes('missing') || lowerMsg.includes('gap') || lowerMsg.includes('why')) {
        const topGaps = sanitizedContext.identifiedGaps.slice(0, 3).map((g) => g.skillName);
        fallbackReply = topGaps.length > 0
          ? `Your primary skill gaps for **${sanitizedContext.targetRole || 'your target role'}** are: **${topGaps.join(', ')}**. Bridging these high-priority competencies will directly improve your alignment with hiring requirements.`
          : 'You do not have any critical open skill gaps at this moment. You are well-positioned for entry-level opportunities in your domain.';
        suggestedActions.push(
          'Enroll in recommended courses for your priority gaps',
          'Build a mini-project applying the missing technologies',
          'Retake skill assessment after learning'
        );
      } else if (lowerMsg.includes('learn') || lowerMsg.includes('30 day') || lowerMsg.includes('next') || lowerMsg.includes('focus') || lowerMsg.includes('plan')) {
        const primaryGap = sanitizedContext.identifiedGaps[0]?.skillName || 'Applied Frameworks';
        fallbackReply = `Here is your recommended 30-day focus:
• **Week 1-2**: Master core fundamentals and syntax of **${primaryGap}**.
• **Week 3**: Integrate **${primaryGap}** into an end-to-end laboratory or portfolio project.
• **Week 4**: Verify competence with a platform assessment and apply to matching roles.`;
        suggestedActions.push(
          `Review official documentation for ${primaryGap}`,
          'Check personalized learning roadmap for milestones',
          'Take verified assessment badge'
        );
      } else if (lowerMsg.includes('internship') || lowerMsg.includes('job') || lowerMsg.includes('opportunity') || lowerMsg.includes('apply')) {
        fallbackReply = `When applying for internships, target positions where your match score exceeds 60%. Your verified skills give you an edge in screening filters. Be sure to highlight your project achievements in your applications.`;
        suggestedActions.push(
          'Check recommended opportunities on your dashboard',
          'Review 5-factor fit breakdown before applying',
          'Complete verified skill assessments to boost match ranking'
        );
      } else if (lowerMsg.includes('strong') || lowerMsg.includes('best') || lowerMsg.includes('strength')) {
        const strongList = sanitizedContext.skills
          .filter((s) => (Number(s.score) || 0) >= 50 || s.level === 'ADVANCED' || s.level === 'EXPERT')
          .map((s) => s.name);
        const displaySkills = strongList.length > 0 ? strongList : sanitizedContext.skills.map((s) => s.name);
        fallbackReply = displaySkills.length > 0
          ? `Your strongest platform-verified skills are: **${displaySkills.slice(0, 4).join(', ')}**. These represent your core competitive advantage when applying to industry opportunities.`
          : 'You have foundational coursework skills recorded. Complete skill assessments to earn verified badges and showcase your top technical strengths.';
        suggestedActions.push(
          'Showcase your strong skills on your digital portfolio',
          'Take skill assessment to earn verified credentials',
          'Search for roles that require your top competencies'
        );
      } else {
        fallbackReply = topRec
          ? `Based on your profile, your primary recommended career is **${topRec.careerRole?.title || 'Technical Specialist'}** (${Math.round(topRec.matchScore)}% readiness). Focus on closing high-priority skill gaps and practicing hands-on problem solving.`
          : `To advance your career in ${sanitizedContext.department || 'Engineering'}, focus on building core skills, verifying your abilities through platform assessments, and exploring matching opportunities.`;
        suggestedActions.push(
          'Explore personalized career roadmap',
          'Take verified skill assessment',
          'Review recommended opportunities'
        );
      }

      const fallback: CareerCopilotOutput = {
        reply: fallbackReply,
        suggestedActions,
        relevantSkills,
      };

      return {
        response: fallback,
        fallbackUsed: true,
        provider: provider.name,
      };
    }
  }

  // ====================================================
  // 5. LEARNING ROADMAP GENERATION
  // ====================================================

  public async generateLearningRoadmap(
    userId: number,
    input: LearningRoadmapInput
  ): Promise<{ roadmap: LearningRoadmapOutput; fallbackUsed: boolean; provider: string }> {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your profile first.');
    }

    const studentId = student.id;
    const targetRole = input.targetRole || student.careerGoal || 'Software Engineer';
    const timeframeWeeks = input.timeframeWeeks || 8;

    const [gapsData, learningRecs, dbPrograms] = await Promise.all([
      this.skillGapRepo.getStudentGaps(studentId, undefined, undefined, 10, 0),
      this.recServ.recommendLearningForStudent(userId, { page: 1, limit: 5 }).catch(() => ({ learningRecommendations: [] })),
      LearningProgram.findAll({
        where: { status: OpportunityStatus.OPEN },
        limit: 20,
      }).catch(() => []),
    ]);

    const gaps = (gapsData.rows || []).map((g: any) => g.skill?.name).filter(Boolean);
    const provider = AIProviderFactory.getProvider();

    // Map existing database learning programs that match gaps or role
    const dbRecommendedCourses = (dbPrograms || [])
      .filter((p: any) => {
        const text = `${p.title} ${p.description || ''} ${p.curriculum || ''}`.toLowerCase();
        return gaps.some((g: string) => text.includes(g.toLowerCase())) || text.includes(targetRole.toLowerCase());
      })
      .map((p: any) => ({
        id: Number(p.id),
        title: p.title,
        provider: p.mode === 'ONLINE' ? 'National Skill Portal' : 'Academic & Industry Partner',
        priority: 'HIGH',
        durationHours: p.durationHours || 20,
        cost: Number(p.cost) || 0,
        url: `/student/jobs`,
      }));

    const systemPrompt = `You are an expert technical curriculum designer. Output strictly valid JSON conforming to the schema with keys:
- targetRole: string
- totalDurationWeeks: number
- milestones: array of { weekNumber: number, topic: string, skillsCovered: string[], learningResources: string[], projectIdea: string }
- recommendedCourses: array of { id?: number, title: string, provider: string, priority: string, durationHours?: number, cost?: number }
Do not wrap your response in markdown fences or include explanations outside the JSON.`;

    const userPrompt = `Create a structured ${timeframeWeeks}-week learning roadmap for the target role: "${targetRole}".
Key skills to learn / gaps to address: ${gaps.join(', ') || 'Core foundation and advanced topics'}.
Available platform programs to prioritize if relevant: ${JSON.stringify(dbRecommendedCourses.map((c) => ({ id: c.id, title: c.title })))}`;

    try {
      const rawOutput = await provider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.2,
      });

      const parsed = this.parseJsonSafe(rawOutput);
      const validated = learningRoadmapOutputSchema.parse(parsed);

      // Merge real DB course IDs if AI omitted them
      const mergedCourses = validated.recommendedCourses.map((rc) => {
        const match = dbRecommendedCourses.find(
          (db) => db.title.toLowerCase().includes(rc.title.toLowerCase()) || rc.title.toLowerCase().includes(db.title.toLowerCase())
        );
        return match ? { ...rc, id: match.id, provider: match.provider, cost: match.cost, durationHours: match.durationHours } : rc;
      });

      return {
        roadmap: {
          ...validated,
          recommendedCourses: mergedCourses.length > 0 ? mergedCourses : dbRecommendedCourses.slice(0, 4),
        },
        fallbackUsed: false,
        provider: provider.name,
      };
    } catch (err: any) {
      // Deterministic Fallback using Phase 14 recommendations + DB learning programs
      const fallbackRoadmap = this.getDeterministicLearningRoadmapFallback(
        targetRole,
        timeframeWeeks,
        gaps,
        dbRecommendedCourses.length > 0
          ? dbRecommendedCourses
          : (learningRecs as any).learningRecommendations || []
      );

      return {
        roadmap: fallbackRoadmap,
        fallbackUsed: true,
        provider: provider.name,
      };
    }
  }

  // ====================================================
  // 6. OPPORTUNITY MATCH EXPLANATION
  // ====================================================

  public async explainOpportunityMatch(
    userId: number,
    opportunityId: number,
    opportunityType: string = 'JOB'
  ): Promise<{
    explanation: OpportunityExplanationOutput;
    fallbackUsed: boolean;
    provider: string;
  }> {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your profile first.');
    }

    // 1. Authoritative deterministic match calculation (source of truth)
    const matchResult = await this.matchingServ.getOpportunityMatchById(
      userId,
      opportunityId,
      opportunityType
    );

    const normType = String(opportunityType).toUpperCase() as OpportunityType;
    const opp = await this.appRepo.findOpportunity(normType, opportunityId);
    const oppData = (opp as any)?.dataValues || opp || {};
    const oppTitle = oppData.title || `${normType} Opportunity`;

    const { matchScore, breakdown } = matchResult;
    const matchedSkills = breakdown.skillMatch.matchedSkills || [];
    const missingSkills = breakdown.skillMatch.missingSkills || [];

    const provider = AIProviderFactory.getProvider();

    const systemPrompt = `You are an AI Career Advisor explaining an opportunity match to a student.
The platform calculated an authoritative 5-factor fit score of ${Math.round(matchScore)}%:
- Skill Match: ${Math.round(breakdown.skillMatch.score)}% (Weight 50%)
- Career Alignment: ${Math.round(breakdown.careerAlignment.score)}% (Weight 20%)
- Experience: ${Math.round(breakdown.experience.score)}% (Weight 10%)
- Assessment: ${Math.round(breakdown.assessment.score)}% (Weight 10%)
- Preference: ${Math.round(breakdown.preference.score)}% (Weight 10%)
Matched Skills: ${matchedSkills.join(', ') || 'None'}
Missing Skills: ${missingSkills.join(', ') || 'None'}

Output strictly valid JSON with keys:
- matchScore: number (must be ${Math.round(matchScore)})
- suitabilitySummary: string (1-2 sentences on suitability)
- strengths: array of string (bullet points of strengths)
- areasToImprove: array of string (bullet points of missing skills/gaps)
- recommendation: string (actionable advice on whether and how to apply)
- matchedSkills: array of string
- missingSkills: array of string
Do not wrap in markdown fences or include explanations outside the JSON.`;

    const userPrompt = `Explain why this student has a ${Math.round(matchScore)}% match for "${oppTitle}" (${normType}) and give actionable guidance.`;

    try {
      const rawOutput = await provider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.2,
      });

      const parsed = this.parseJsonSafe(rawOutput);
      const validated: OpportunityExplanationOutput = opportunityExplanationOutputSchema.parse({
        ...parsed,
        matchScore: Number(matchScore),
        matchedSkills,
        missingSkills,
      });

      await this.aiRepo.createAnalysis({
        userId,
        analysisType: 'OPPORTUNITY_EXPLANATION',
        provider: provider.name,
        inputData: { opportunityId, opportunityType: normType, matchScore },
        outputData: validated,
      });

      return {
        explanation: validated,
        fallbackUsed: false,
        provider: provider.name,
      };
    } catch (err: any) {
      // Deterministic fallback using breakdown rules
      const strengths: string[] = [];
      if (matchedSkills.length > 0) {
        strengths.push(`Strong verified competencies in: ${matchedSkills.slice(0, 4).join(', ')}.`);
      }
      if (breakdown.careerAlignment.score >= 50) {
        strengths.push(`Your career goals directly align with this ${normType.toLowerCase()} role.`);
      }
      if (breakdown.assessment.score >= 50) {
        strengths.push(`Verified assessment badges confirm your core domain readiness.`);
      }
      if (breakdown.experience.score >= 50) {
        strengths.push(`Prior relevant internship or project work strengthens your candidate profile.`);
      }
      if (strengths.length === 0) {
        strengths.push('Foundational coursework and analytical competencies provide a transferable base.');
      }

      const areasToImprove: string[] = [];
      if (missingSkills.length > 0) {
        areasToImprove.push(`Develop or benchmark required technologies: ${missingSkills.slice(0, 4).join(', ')}.`);
      }
      if (breakdown.assessment.score < 50) {
        areasToImprove.push('Take verified skill assessments to showcase test performance to hiring teams.');
      }
      if (areasToImprove.length === 0) {
        areasToImprove.push('Build a capstone project demonstrating end-to-end execution.');
      }

      const suitabilitySummary =
        matchScore >= 75
          ? `You are an exceptionally strong match (${Math.round(matchScore)}% fit) for this role. Your verified skills and career goals align closely with expectations.`
          : matchScore >= 50
          ? `You have a competitive foundation (${Math.round(matchScore)}% fit). Highlighting your matched skills and addressing key gaps will strengthen your chances.`
          : `You match ${Math.round(matchScore)}% of prerequisites. Closing the identified skill gaps first will significantly improve your competitiveness.`;

      const recommendation =
        matchScore >= 75
          ? 'You are a strong candidate and should definitely consider applying.'
          : matchScore >= 50
          ? 'Consider applying while tailoring your cover letter to highlight your matching skills.'
          : 'Focus on closing priority skill gaps with recommended learning programs before applying.';

      const fallback: OpportunityExplanationOutput = {
        matchScore: Number(matchScore),
        suitabilitySummary,
        strengths,
        areasToImprove,
        recommendation,
        matchedSkills,
        missingSkills,
      };

      await this.aiRepo.createAnalysis({
        userId,
        analysisType: 'OPPORTUNITY_EXPLANATION',
        provider: `${provider.name}-fallback`,
        inputData: { opportunityId, opportunityType: normType, matchScore },
        outputData: fallback,
      });

      return {
        explanation: fallback,
        fallbackUsed: true,
        provider: provider.name,
      };
    }
  }

  // ====================================================
  // HELPER METHODS
  // ====================================================

  private parseJsonSafe(raw: string): any {
    try {
      // Remove possible markdown backticks if present
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (err: any) {
      throw new AIProviderError(`Failed to parse AI response as JSON: ${err.message}`);
    }
  }

  private getDeterministicResumeAnalysisFallback(text: string): ResumeAnalysisOutput {
    return {
      skills: ['Problem Solving', 'Communication', 'Analytical Thinking'],
      experienceSummary: 'Candidate profile extracted from submitted materials.',
      strengths: ['Relevant domain background', 'Academic foundation'],
      skillGaps: ['Industry framework specialization', 'Production deployment experience'],
      careerRelevance: 'Aligned with foundational technical and operational roles.',
      improvementSuggestions: [
        'Complete hands-on projects featuring end-to-end implementation.',
        'Obtain verified skill assessment badges on the platform.',
      ],
    };
  }

  private getDeterministicOpportunityAnalysisFallback(context: any): OpportunityAnalysisOutput {
    return {
      roleSummary: `${context.title} role requiring foundational and specialized competencies.`,
      extractedSkills: context.requirements ? context.requirements.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Technical Skills'],
      experienceLevel: 'Entry to Mid Level',
      keyResponsibilities: [
        'Execute assigned technical deliverables according to standards.',
        'Collaborate with cross-functional teams to resolve technical challenges.',
      ],
      candidatePreparationTips: [
        'Prepare clean code demonstrations matching the stated requirements.',
        'Be ready to discuss past projects and architecture tradeoffs.',
      ],
    };
  }

  private getDeterministicLearningRoadmapFallback(
    targetRole: string,
    timeframeWeeks: number,
    gaps: string[],
    recommendations: any[]
  ): LearningRoadmapOutput {
    const milestones = [];
    const skillsToDistribute = gaps.length > 0 ? gaps : ['Core Principles', 'Tooling & Ecosystem', 'Applied Projects'];

    for (let w = 1; w <= timeframeWeeks; w++) {
      const skillIdx = (w - 1) % skillsToDistribute.length;
      const currentSkill = skillsToDistribute[skillIdx];
      milestones.push({
        weekNumber: w,
        topic: `Mastering ${currentSkill} - Part ${Math.floor((w - 1) / skillsToDistribute.length) + 1}`,
        skillsCovered: [currentSkill],
        learningResources: [`Official Documentation for ${currentSkill}`, `Interactive Tutorials & Exercises`],
        projectIdea: `Build a small working prototype demonstrating ${currentSkill}.`,
      });
    }

    const recommendedCourses = recommendations.map((r) => ({
      id: r.id,
      title: r.title || r.skillName || 'Skill Specialization',
      provider: r.provider || 'Platform Partner',
      priority: r.priority || 'HIGH',
      durationHours: r.durationHours,
      cost: r.cost,
      url: r.url,
    }));

    return {
      targetRole,
      totalDurationWeeks: timeframeWeeks,
      milestones,
      recommendedCourses: recommendedCourses.length > 0 ? recommendedCourses : [
        { title: `${targetRole} Foundations`, provider: 'Platform Partner', priority: 'HIGH' },
      ],
    };
  }
}

export const aiService = new AIService();
