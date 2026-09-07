import { z } from 'zod';

export const resumeAnalysisOutputSchema = z.object({
  skills: z.array(z.string().trim()).default([]),
  experienceSummary: z.string().trim().default('No experience summary provided.'),
  strengths: z.array(z.string().trim()).default([]),
  skillGaps: z.array(z.string().trim()).default([]),
  careerRelevance: z.string().trim().default('General domain alignment.'),
  improvementSuggestions: z.array(z.string().trim()).default([]),
});

export const opportunityAnalysisOutputSchema = z.object({
  roleSummary: z.string().trim().default('Opportunity analysis summary.'),
  extractedSkills: z.array(z.string().trim()).default([]),
  experienceLevel: z.string().trim().default('Not specified'),
  keyResponsibilities: z.array(z.string().trim()).default([]),
  candidatePreparationTips: z.array(z.string().trim()).default([]),
});

export const skillGapExplanationItemSchema = z.object({
  skillName: z.string().trim(),
  importanceReason: z.string().trim(),
  learningSuggestions: z.array(z.string().trim()).default([]),
});

export const skillGapExplanationOutputSchema = z.object({
  explanations: z.array(skillGapExplanationItemSchema).default([]),
  recommendedOrder: z.array(z.string().trim()).default([]),
  overallRecommendation: z.string().trim().default('Focus on high-priority skill gaps.'),
});

export const careerCopilotOutputSchema = z.object({
  reply: z.string().trim().min(1, 'Copilot response cannot be empty'),
  suggestedActions: z.array(z.string().trim()).default([]),
  relevantSkills: z.array(z.string().trim()).default([]),
});

export const learningRoadmapMilestoneSchema = z.object({
  weekNumber: z.coerce.number().int().positive(),
  topic: z.string().trim(),
  skillsCovered: z.array(z.string().trim()).default([]),
  learningResources: z.array(z.string().trim()).default([]),
  projectIdea: z.string().trim().default('Practical mini-project to reinforce skills.'),
});

export const learningRoadmapCourseSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().trim(),
  provider: z.string().trim().default('Self-paced / Online'),
  priority: z.string().trim().default('MEDIUM'),
  durationHours: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
  url: z.string().trim().optional(),
});

export const learningRoadmapOutputSchema = z.object({
  targetRole: z.string().trim().default('Career Goal'),
  totalDurationWeeks: z.coerce.number().int().min(1).default(8),
  milestones: z.array(learningRoadmapMilestoneSchema).default([]),
  recommendedCourses: z.array(learningRoadmapCourseSchema).default([]),
});

export const opportunityExplanationOutputSchema = z.object({
  matchScore: z.coerce.number().default(0),
  suitabilitySummary: z.string().trim().default('Suitability analysis completed.'),
  strengths: z.array(z.string().trim()).default([]),
  areasToImprove: z.array(z.string().trim()).default([]),
  recommendation: z.string().trim().default('Review the opportunity details and apply if interested.'),
  matchedSkills: z.array(z.string().trim()).default([]),
  missingSkills: z.array(z.string().trim()).default([]),
});

export type ResumeAnalysisOutput = z.infer<typeof resumeAnalysisOutputSchema>;
export type OpportunityAnalysisOutput = z.infer<typeof opportunityAnalysisOutputSchema>;
export type SkillGapExplanationOutput = z.infer<typeof skillGapExplanationOutputSchema>;
export type CareerCopilotOutput = z.infer<typeof careerCopilotOutputSchema>;
export type LearningRoadmapOutput = z.infer<typeof learningRoadmapOutputSchema>;
export type OpportunityExplanationOutput = z.infer<typeof opportunityExplanationOutputSchema>;

