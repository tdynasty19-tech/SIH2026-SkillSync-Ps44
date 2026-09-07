import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { AssessmentAttemptStatus } from '../constants/enums';

export interface AssessmentAttemptAttributes {
  id: number;
  assessmentId: number;
  studentId: number;
  startedAt: Date;
  completedAt?: Date | null;
  score?: number | null;
  percentage?: number | null;
  status: AssessmentAttemptStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssessmentAttemptCreationAttributes
  extends Optional<
    AssessmentAttemptAttributes,
    'id' | 'completedAt' | 'score' | 'percentage' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class AssessmentAttempt
  extends Model<AssessmentAttemptAttributes, AssessmentAttemptCreationAttributes>
  implements AssessmentAttemptAttributes
{
  public id!: number;
  public assessmentId!: number;
  public studentId!: number;
  public startedAt!: Date;
  public completedAt!: Date | null;
  public score!: number | null;
  public percentage!: number | null;
  public status!: AssessmentAttemptStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AssessmentAttempt.init(
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
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'student_id',
      references: {
        model: 'student_profiles',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'started_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'score',
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'percentage',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AssessmentAttemptStatus)),
      allowNull: false,
      defaultValue: AssessmentAttemptStatus.IN_PROGRESS,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'assessment_attempts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['assessment_id'] },
      { fields: ['student_id'] },
      { fields: ['status'] },
    ],
  }
);
