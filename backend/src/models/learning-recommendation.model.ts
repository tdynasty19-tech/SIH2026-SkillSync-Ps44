import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { SkillGapPriority } from '../constants/enums';

export interface LearningRecommendationAttributes {
  id: number;
  studentId: number;
  skillId: number;
  title: string;
  resourceUrl: string;
  provider: string;
  duration?: string | null;
  cost?: number;
  priority?: SkillGapPriority;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LearningRecommendationCreationAttributes
  extends Optional<
    LearningRecommendationAttributes,
    'id' | 'duration' | 'cost' | 'priority' | 'createdAt' | 'updatedAt'
  > {}

export class LearningRecommendation
  extends Model<LearningRecommendationAttributes, LearningRecommendationCreationAttributes>
  implements LearningRecommendationAttributes
{
  public id!: number;
  public studentId!: number;
  public skillId!: number;
  public title!: string;
  public resourceUrl!: string;
  public provider!: string;
  public duration!: string | null;
  public cost!: number;
  public priority!: SkillGapPriority;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LearningRecommendation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'student_id',
      references: {
        model: 'student_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title',
    },
    resourceUrl: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      field: 'resource_url',
    },
    provider: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'provider',
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'duration',
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: 'cost',
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(SkillGapPriority)),
      allowNull: false,
      defaultValue: SkillGapPriority.MEDIUM,
      field: 'priority',
    },
  },
  {
    sequelize,
    tableName: 'learning_recommendations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['skill_id'] },
    ],
  }
);
