import { sequelize } from '../config/database';
import { assessmentRepository, AssessmentRepository } from '../repositories/assessment.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { skillGapService, SkillGapService } from './skill-gap.service';
import { studentService, StudentService } from './student.service';
import { StudentSkill } from '../models/student-skill.model';
import { AssessmentAnswerCreationAttributes } from '../models/assessment-answer.model';
import { AssessmentAttemptStatus, StudentSkillLevel } from '../constants/enums';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  AuthorizationError,
} from '../errors/app.error';
import { SubmitAssessmentInput } from '../validators/assessment.validator';

export class AssessmentService {
  constructor(
    private readonly repository: AssessmentRepository = assessmentRepository,
    private readonly studentRepo: StudentRepository = studentRepository,
    private readonly gapService: SkillGapService = skillGapService,
    private readonly studService: StudentService = studentService
  ) {}

  public async getAssessments(skillId?: number, difficulty?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getAssessments(skillId, difficulty, limit, offset);

    return {
      assessments: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getAssessmentById(id: number) {
    const assessment = await this.repository.getAssessmentById(id);
    if (!assessment) {
      throw new NotFoundError('Assessment not found or is inactive');
    }

    const safeQuestions = await this.repository.getSafeQuestions(id);

    return {
      ...assessment.toJSON(),
      questions: safeQuestions,
    };
  }

  public async startAttempt(userId: number, assessmentId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please create your profile first.');
    }

    const assessment = await this.repository.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found or is inactive');
    }

    // Check if there is an in-progress attempt already
    const activeAttempt = await this.repository.findActiveAttempt(assessmentId, student.id);
    if (activeAttempt) {
      const safeQuestions = await this.repository.getSafeQuestions(assessmentId);
      return {
        message: 'Resuming existing active attempt',
        attempt: activeAttempt.toJSON(),
        questions: safeQuestions,
      };
    }

    // Create new attempt (students can take/retake assessments to practice and improve their skill ratings)
    const created = await this.repository.createAttempt({
      assessmentId,
      studentId: student.id,
      startedAt: new Date(),
      status: AssessmentAttemptStatus.IN_PROGRESS,
    });

    const safeQuestions = await this.repository.getSafeQuestions(assessmentId);

    return {
      message: 'Assessment attempt started successfully',
      attempt: created.toJSON(),
      questions: safeQuestions,
    };
  }

  public async getAttempt(userId: number, attemptId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const attempt = await this.repository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Assessment attempt not found');
    }

    if (attempt.studentId !== student.id) {
      throw new NotFoundError('Assessment attempt not found or does not belong to you');
    }

    const safeQuestions = await this.repository.getSafeQuestions(attempt.assessmentId);

    return {
      ...attempt.toJSON(),
      questions: safeQuestions,
    };
  }

  /**
   * Authoritative Transactional Submission
   * Backend evaluates correctness, calculates scores, updates trusted StudentSkill and SkillGaps
   */
  public async submitAttempt(userId: number, attemptId: number, input: SubmitAssessmentInput) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const attempt = await this.repository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Assessment attempt not found');
    }

    if (attempt.studentId !== student.id) {
      throw new NotFoundError('Assessment attempt not found or does not belong to you');
    }

    if (attempt.status === AssessmentAttemptStatus.COMPLETED) {
      throw new ConflictError('This assessment attempt has already been submitted and completed');
    }

    const assessment = await this.repository.getAssessmentById(attempt.assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    // Fetch questions with correct answers and options for robust internal scoring
    const scoringQuestions = await this.repository.getQuestionsForScoring(assessment.id);
    const questionsMap = new Map<number, (typeof scoringQuestions)[0]>();
    for (const q of scoringQuestions) {
      questionsMap.set(q.id, q);
    }

    // Validate no duplicate answers for the same question
    const answeredQuestionIds = new Set<number>();
    for (const a of input.answers) {
      if (answeredQuestionIds.has(a.questionId)) {
        throw new ValidationError(`Duplicate answer submitted for questionId ${a.questionId}`);
      }
      answeredQuestionIds.add(a.questionId);

      if (!questionsMap.has(a.questionId)) {
        throw new ValidationError(`Question ID ${a.questionId} does not belong to this assessment`);
      }
    }

    // Evaluate answers
    let totalScore = 0;
    let totalAvailablePoints = 0;
    for (const q of scoringQuestions) {
      totalAvailablePoints += q.points;
    }

    const answerRecords: AssessmentAnswerCreationAttributes[] = [];
    for (const a of input.answers) {
      const q = questionsMap.get(a.questionId)!;
      let isCorrect = false;

      const userAns = a.answer.trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();

      // Direct exact match
      if (userAns === correctAns) {
        isCorrect = true;
      } else {
        // Evaluate against option structures (object map or array)
        let parsedOptions = q.options;
        if (typeof parsedOptions === 'string') {
          try {
            parsedOptions = JSON.parse(parsedOptions);
          } catch (_) {}
        }

        if (parsedOptions && typeof parsedOptions === 'object') {
          if (!Array.isArray(parsedOptions)) {
            // Object format: { "A": "Heap Memory", "B": "Thread Stack" }
            for (const [optKey, optVal] of Object.entries(parsedOptions)) {
              const k = optKey.trim().toLowerCase();
              const v = String(optVal).trim().toLowerCase();

              // If correct answer is key "A" and user submitted "Heap Memory", "A. Heap Memory", or "A"
              if (correctAns === k && (userAns === v || userAns === `${k}. ${v}` || userAns === `${k}: ${v}` || userAns === k)) {
                isCorrect = true;
                break;
              }
              // If correct answer is value "Heap Memory" and user submitted "A", "A. Heap Memory", or "Heap Memory"
              if (correctAns === v && (userAns === k || userAns === `${k}. ${v}` || userAns === `${k}: ${v}` || userAns === v)) {
                isCorrect = true;
                break;
              }
            }
          } else {
            // Array format: ["Heap Memory", "Thread Stack"]
            const arr = parsedOptions as any[];
            // If correct answer is letter index (e.g. "a" -> index 0)
            if (correctAns.length === 1 && correctAns >= 'a' && correctAns <= 'z') {
              const idx = correctAns.charCodeAt(0) - 97;
              if (idx >= 0 && idx < arr.length) {
                const targetText = String(arr[idx]).trim().toLowerCase();
                if (userAns === targetText || userAns === `${correctAns}. ${targetText}`) {
                  isCorrect = true;
                }
              }
            }
            // If user answered with letter index (e.g. user answered "a" for 0th element)
            if (userAns.length === 1 && userAns >= 'a' && userAns <= 'z') {
              const uIdx = userAns.charCodeAt(0) - 97;
              if (uIdx >= 0 && uIdx < arr.length) {
                const targetText = String(arr[uIdx]).trim().toLowerCase();
                if (correctAns === targetText) {
                  isCorrect = true;
                }
              }
            }
          }
        }
      }

      const pointsEarned = isCorrect ? q.points : 0;
      totalScore += pointsEarned;

      answerRecords.push({
        attemptId: attempt.id,
        questionId: a.questionId,
        answer: a.answer.trim(),
        isCorrect,
        pointsEarned,
      });
    }

    const percentage =
      totalAvailablePoints > 0 ? Math.round((totalScore / totalAvailablePoints) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    // Determine derived skill level
    let derivedLevel: StudentSkillLevel;
    if (percentage >= 85) {
      derivedLevel = StudentSkillLevel.EXPERT;
    } else if (percentage >= 70) {
      derivedLevel = StudentSkillLevel.ADVANCED;
    } else if (percentage >= 50) {
      derivedLevel = StudentSkillLevel.INTERMEDIATE;
    } else {
      derivedLevel = StudentSkillLevel.BEGINNER;
    }

    // Execute transactional update
    const result = await sequelize.transaction(async (t) => {
      // 1. Persist answers
      await this.repository.saveAnswers(answerRecords, t);

      // 2. Complete attempt
      await this.repository.updateAttempt(
        attempt.id,
        {
          score: totalScore,
          percentage,
          status: AssessmentAttemptStatus.COMPLETED,
          completedAt: new Date(),
        },
        t
      );

      // 3. Update trusted student skill
      const existingSkill = await StudentSkill.findOne({
        where: { studentId: student.id, skillId: assessment.skillId },
        transaction: t,
      });

      if (existingSkill) {
        await existingSkill.update(
          {
            score: percentage,
            level: derivedLevel,
            verified: passed,
            source: 'Assessment',
            lastAssessedAt: new Date(),
          },
          { transaction: t }
        );
      } else {
        await StudentSkill.create(
          {
            studentId: student.id,
            skillId: assessment.skillId,
            level: derivedLevel,
            score: percentage,
            verified: passed,
            source: 'Assessment',
            lastAssessedAt: new Date(),
          },
          { transaction: t }
        );
      }

      // 4. Recalculate skill gaps
      await this.gapService.calculateGapsForStudent(student.id, t);

      return {
        attemptId: attempt.id,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        score: totalScore,
        totalPoints: totalAvailablePoints,
        percentage,
        passingScore: assessment.passingScore,
        passed,
        level: derivedLevel,
        status: AssessmentAttemptStatus.COMPLETED,
        completedAt: new Date(),
      };
    });

    // Recalculate profile completion after skill update
    await this.studService.recalculateCompletion(student);

    return result;
  }

  public async getStudentAttempts(
    userId: number,
    status?: AssessmentAttemptStatus,
    page = 1,
    limit = 20
  ) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getStudentAttempts(
      student.id,
      status,
      limit,
      offset
    );

    return {
      attempts: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export const assessmentService = new AssessmentService();
