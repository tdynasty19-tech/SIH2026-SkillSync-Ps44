export interface MatchWeights {
  SKILL_MATCH: number;
  CAREER_ALIGNMENT: number;
  EXPERIENCE: number;
  ASSESSMENT: number;
  PREFERENCE: number;
}

export interface SkillMatchBreakdown {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  weight: number;
}

export interface CareerAlignmentBreakdown {
  score: number;
  matchedRole: string | null;
  weight: number;
}

export interface ExperienceBreakdown {
  score: number;
  totalMonths: number;
  hasRelevantExperience: boolean;
  weight: number;
}

export interface AssessmentBreakdown {
  score: number;
  assessedSkillsCount: number;
  weight: number;
}

export interface PreferenceBreakdown {
  score: number;
  locationMatch: boolean;
  workplaceType: string | null;
  weight: number;
}

export interface MatchBreakdown {
  weights: MatchWeights;
  skillMatch: SkillMatchBreakdown;
  careerAlignment: CareerAlignmentBreakdown;
  experience: ExperienceBreakdown;
  assessment: AssessmentBreakdown;
  preference: PreferenceBreakdown;
  finalScore: number;
}

export interface MatchResult {
  studentId: number;
  opportunityId: number;
  opportunityType: string;
  matchScore: number;
  breakdown: MatchBreakdown;
}
