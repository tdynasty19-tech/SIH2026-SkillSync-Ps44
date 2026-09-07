import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AssessmentAnswerAttributes {
  id: number;
  attemptId: number;
  questionId: number;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssessmentAnswerCreationAttributes
  extends Optional<AssessmentAnswerAttributes, 'id' | 'isCorrect' | 'pointsEarned' | 'createdAt' | 'updatedAt'> {}

export class AssessmentAnswer
  extends Model<AssessmentAnswerAttributes, AssessmentAnswerCreationAttributes>
  implements AssessmentAnswerAttributes
{
  public id!: number;
  public attemptId!: number;
  public questionId!: number;
  public answer!: string;
  public isCorrect!: boolean;
  public pointsEarned!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AssessmentAnswer.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    attemptId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'attempt_id',
      references: {
        model: 'assessment_attempts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    questionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'question_id',
      references: {
        model: 'assessment_questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'answer',
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_correct',
    },
    pointsEarned: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'points_earned',
    },
  },
  {
    sequelize,
    tableName: 'assessment_answers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['attempt_id'] },
      { fields: ['question_id'] },
      { unique: true, fields: ['attempt_id', 'question_id'] },
    ],
  }
);
