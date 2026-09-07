import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { AssessmentQuestionType } from '../constants/enums';

export interface AssessmentQuestionAttributes {
  id: number;
  assessmentId: number;
  question: string;
  questionType: AssessmentQuestionType;
  options: object | any[];
  correctAnswer: string;
  points: number;
  explanation?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssessmentQuestionCreationAttributes
  extends Optional<
    AssessmentQuestionAttributes,
    'id' | 'questionType' | 'points' | 'explanation' | 'order' | 'createdAt' | 'updatedAt'
  > {}

export class AssessmentQuestion
  extends Model<AssessmentQuestionAttributes, AssessmentQuestionCreationAttributes>
  implements AssessmentQuestionAttributes
{
  public id!: number;
  public assessmentId!: number;
  public question!: string;
  public questionType!: AssessmentQuestionType;
  public options!: object | any[];
  public correctAnswer!: string;
  public points!: number;
  public explanation!: string | null;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Mask sensitive correct answer from default JSON serializer
  public toJSON(): object {
    const values = { ...this.get() };
    delete (values as any).correctAnswer;
    return values;
  }
}

AssessmentQuestion.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    assessmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'assessment_id',
      references: {
        model: 'skill_assessments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'question',
    },
    questionType: {
      type: DataTypes.ENUM(...Object.values(AssessmentQuestionType)),
      allowNull: false,
      defaultValue: AssessmentQuestionType.MULTIPLE_CHOICE,
      field: 'question_type',
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'options',
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'correct_answer',
    },
    points: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'points',
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'explanation',
    },
    order: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'order',
    },
  },
  {
    sequelize,
    tableName: 'assessment_questions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['assessment_id'] },
      { fields: ['assessment_id', 'order'] },
    ],
  }
);
