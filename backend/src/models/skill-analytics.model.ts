import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SkillAnalyticsAttributes {
  id: number;
  institutionId: number;
  department: string;
  skillId: number;
  totalAssessedStudents: number;
  averageScore: number;
  proficientCount: number;
  gapCount: number;
  academicYear: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillAnalyticsCreationAttributes
  extends Optional<
    SkillAnalyticsAttributes,
    'id' | 'totalAssessedStudents' | 'averageScore' | 'proficientCount' | 'gapCount' | 'createdAt' | 'updatedAt'
  > {}

export class SkillAnalytics
  extends Model<SkillAnalyticsAttributes, SkillAnalyticsCreationAttributes>
  implements SkillAnalyticsAttributes
{
  public id!: number;
  public institutionId!: number;
  public department!: string;
  public skillId!: number;
  public totalAssessedStudents!: number;
  public averageScore!: number;
  public proficientCount!: number;
  public gapCount!: number;
  public academicYear!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SkillAnalytics.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'department',
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
    totalAssessedStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'total_assessed_students',
    },
    averageScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: 'average_score',
    },
    proficientCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'proficient_count',
    },
    gapCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'gap_count',
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academic_year',
    },
  },
  {
    sequelize,
    tableName: 'skill_analytics',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { fields: ['department'] },
      { fields: ['skill_id'] },
      { fields: ['academic_year'] },
    ],
  }
);
