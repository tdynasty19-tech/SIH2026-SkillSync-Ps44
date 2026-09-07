import { Transaction } from 'sequelize';
import '../models';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import {
  AssessmentAttempt,
  AssessmentAttemptAttributes,
  AssessmentAttemptCreationAttributes,
} from '../models/assessment-attempt.model';
import {
  AssessmentAnswer,
  AssessmentAnswerCreationAttributes,
} from '../models/assessment-answer.model';
import { Skill } from '../models/skill.model';
import { AssessmentAttemptStatus } from '../constants/enums';

export class AssessmentRepository {
  public async getAssessments(skillId?: number, difficulty?: string, limit = 20, offset = 0) {
    const where: any = { isActive: true };
    if (skillId) where.skillId = skillId;
    if (difficulty) where.difficulty = difficulty;

    return SkillAssessment.findAndCountAll({
      where,
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getAssessmentById(id: number) {
    return SkillAssessment.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });
  }

  /**
   * Returns questions for student viewing - strictly excluding correctAnswer and explanation
   */
  public async getSafeQuestions(assessmentId: number) {
    return AssessmentQuestion.findAll({
      where: { assessmentId },
      attributes: ['id', 'assessmentId', 'question', 'questionType', 'options', 'points', 'order'],
      order: [['order', 'ASC']],
    });
  }

  /**
   * Internal scoring method - includes correctAnswer, points, options, and questionType for robust evaluation
   */
  public async getQuestionsForScoring(assessmentId: number) {
    return AssessmentQuestion.findAll({
      where: { assessmentId },
      attributes: ['id', 'assessmentId', 'correctAnswer', 'points', 'options', 'questionType'],
    });
  }

  public async findAttemptById(id: number) {
    return AssessmentAttempt.findByPk(id, {
      include: [
        {
          model: SkillAssessment,
          as: 'assessment',
          attributes: ['id', 'title', 'skillId', 'difficulty', 'passingScore', 'totalQuestions'],
        },
        {
          model: AssessmentAnswer,
          as: 'answers',
          attributes: ['id', 'questionId', 'answer', 'isCorrect', 'pointsEarned'],
        },
      ],
    });
  }

  public async findActiveAttempt(assessmentId: number, studentId: number) {
    return AssessmentAttempt.findOne({
      where: {
        assessmentId,
        studentId,
        status: AssessmentAttemptStatus.IN_PROGRESS,
      },
    });
  }

  public async findCompletedAttempts(assessmentId: number, studentId: number) {
    return AssessmentAttempt.findAll({
      where: {
        assessmentId,
        studentId,
        status: AssessmentAttemptStatus.COMPLETED,
      },
      order: [['completedAt', 'DESC']],
    });
  }

  public async createAttempt(
    data: AssessmentAttemptCreationAttributes,
    transaction?: Transaction
  ): Promise<AssessmentAttempt> {
    return AssessmentAttempt.create(data, { transaction });
  }

  public async updateAttempt(
    id: number,
    data: Partial<AssessmentAttemptAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return AssessmentAttempt.update(data, {
      where: { id },
      transaction,
    });
  }

  public async saveAnswers(
    answers: AssessmentAnswerCreationAttributes[],
    transaction?: Transaction
  ) {
    return AssessmentAnswer.bulkCreate(answers, { transaction });
  }

  public async getStudentAttempts(
    studentId: number,
    status?: AssessmentAttemptStatus,
    limit = 20,
    offset = 0
  ) {
    const where: any = { studentId };
    if (status) where.status = status;

    return AssessmentAttempt.findAndCountAll({
      where,
      include: [
        {
          model: SkillAssessment,
          as: 'assessment',
          attributes: ['id', 'title', 'difficulty', 'passingScore', 'skillId'],
          include: [
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
