/**
 * AI Data Minimization and Privacy Sanitizer
 * Strictly adheres to Phase 16 Privacy requirements:
 * NEVER send passwords, hashes, JWTs, refresh tokens, or unnecessary personal info.
 */

export class AIDataSanitizer {
  private static readonly SECRET_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, replacement: '[REDACTED_TOKEN]' },
    { pattern: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, replacement: '[REDACTED_TOKEN]' }, // JWT pattern
    { pattern: /\$2[aby]\$\d+\$[./A-Za-z0-9]{53}/g, replacement: '[REDACTED_HASH]' }, // Bcrypt hash
    { pattern: /(?:password|pass|secret|token)\s*[:=]\s*[^\s,;]+/gi, replacement: '[REDACTED_PASSWORD]' },
    { pattern: /\b[A-Za-z0-9+/]{32,}={0,2}\b/g, replacement: '[REDACTED_TOKEN]' }, // Long base64/hex token
  ];

  public static sanitizeText(text: string, maxLength = 8000): string {
    if (!text) return '';
    let sanitized = text.slice(0, maxLength);
    for (const { pattern, replacement } of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized.trim();
  }

  public static sanitizeStudentContext(data: {
    headline?: string | null;
    department?: string | null;
    course?: string | null;
    skills?: Array<{ name: string; level: string; score?: number | null }>;
    gaps?: Array<{ skillName: string; priority: string; gapScore?: number }>;
    targetRole?: string | null;
  }) {
    return {
      headline: data.headline ? this.sanitizeText(data.headline, 200) : undefined,
      department: data.department || undefined,
      course: data.course || undefined,
      targetRole: data.targetRole || undefined,
      skills: (data.skills || []).slice(0, 30).map((s) => ({
        name: s.name,
        level: s.level,
        score: s.score,
      })),
      identifiedGaps: (data.gaps || []).slice(0, 10).map((g) => ({
        skillName: g.skillName,
        priority: g.priority,
        gapScore: g.gapScore,
      })),
    };
  }

  public static sanitizeOpportunityContext(data: {
    title: string;
    description: string;
    requirements?: string | null;
    workplaceType?: string;
    employmentType?: string;
  }) {
    return {
      title: this.sanitizeText(data.title, 200),
      description: this.sanitizeText(data.description, 4000),
      requirements: data.requirements ? this.sanitizeText(data.requirements, 2000) : undefined,
      workplaceType: data.workplaceType,
      employmentType: data.employmentType,
    };
  }
}
