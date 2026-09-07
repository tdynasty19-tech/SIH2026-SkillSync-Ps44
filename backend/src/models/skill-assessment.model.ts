import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SkillAssessmentAttributes {
  id: number;
  title: string;
  description?: string | null;
  skillId: number;
  difficulty: string;
  durationMinutes: number;
  passingScore: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillAssessmentCreationAttributes
  extends Optional<SkillAssessmentAttributes, 'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class SkillAssessment
  extends Model<SkillAssessmentAttributes, SkillAssessmentCreationAttributes>
  implements SkillAssessmentAttributes
{
  public id!: number;
  public title!: string;
  public description!: string | null;
  public skillId!: number;
  public difficulty!: string;
  public durationMinutes!: number;
  public passingScore!: number;
  public totalQuestions!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SkillAssessment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    skillId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'skill_id',
      references: {
        model: 'skills',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    difficulty: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'INTERMEDIATE',
      field: 'difficulty',
    },
    durationMinutes: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 30,
      field: 'duration_minutes',
    },
    passingScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 60.0,
      field: 'passing_score',
    },
    totalQuestions: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
      field: 'total_questions',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'skill_assessments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['skill_id'] },
      { fields: ['difficulty'] },
      { fields: ['is_active'] },
    ],
  }
);
