import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { SkillGapPriority, SkillGapStatus, StudentSkillLevel } from '../constants/enums';

export interface SkillGapAttributes {
  id: number;
  studentId: number;
  skillId: number;
  targetRoleId?: number | null;
  currentLevel?: StudentSkillLevel | null;
  requiredLevel: StudentSkillLevel;
  currentScore?: number | null;
  requiredScore: number;
  gapScore: number;
  priority: SkillGapPriority;
  status: SkillGapStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillGapCreationAttributes
  extends Optional<
    SkillGapAttributes,
    | 'id'
    | 'targetRoleId'
    | 'currentLevel'
    | 'currentScore'
    | 'priority'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class SkillGap
  extends Model<SkillGapAttributes, SkillGapCreationAttributes>
  implements SkillGapAttributes
{
  public id!: number;
  public studentId!: number;
  public skillId!: number;
  public targetRoleId!: number | null;
  public currentLevel!: StudentSkillLevel | null;
  public requiredLevel!: StudentSkillLevel;
  public currentScore!: number | null;
  public requiredScore!: number;
  public gapScore!: number;
  public priority!: SkillGapPriority;
  public status!: SkillGapStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SkillGap.init(
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
    targetRoleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'target_role_id',
      references: {
        model: 'career_roles',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    currentLevel: {
      type: DataTypes.ENUM(...Object.values(StudentSkillLevel)),
      allowNull: true,
      field: 'current_level',
    },
    requiredLevel: {
      type: DataTypes.ENUM(...Object.values(StudentSkillLevel)),
      allowNull: false,
      field: 'required_level',
    },
    currentScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'current_score',
    },
    requiredScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 70.0,
      field: 'required_score',
    },
    gapScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'gap_score',
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(SkillGapPriority)),
      allowNull: false,
      defaultValue: SkillGapPriority.MEDIUM,
      field: 'priority',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SkillGapStatus)),
      allowNull: false,
      defaultValue: SkillGapStatus.OPEN,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'skill_gaps',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['skill_id'] },
      { fields: ['target_role_id'] },
      { fields: ['priority'] },
      { fields: ['status'] },
    ],
  }
);
