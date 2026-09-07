import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { StudentSkillLevel } from '../constants/enums';

export interface CareerRoleSkillAttributes {
  id: number;
  careerRoleId: number;
  skillId: number;
  requiredLevel: StudentSkillLevel;
  importanceWeight?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CareerRoleSkillCreationAttributes
  extends Optional<CareerRoleSkillAttributes, 'id' | 'importanceWeight' | 'createdAt' | 'updatedAt'> {}

export class CareerRoleSkill
  extends Model<CareerRoleSkillAttributes, CareerRoleSkillCreationAttributes>
  implements CareerRoleSkillAttributes
{
  public id!: number;
  public careerRoleId!: number;
  public skillId!: number;
  public requiredLevel!: StudentSkillLevel;
  public importanceWeight!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CareerRoleSkill.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    careerRoleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'career_role_id',
      references: {
        model: 'career_roles',
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
    requiredLevel: {
      type: DataTypes.ENUM(...Object.values(StudentSkillLevel)),
      allowNull: false,
      defaultValue: StudentSkillLevel.INTERMEDIATE,
      field: 'required_level',
    },
    importanceWeight: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 1.0,
      field: 'importance_weight',
    },
  },
  {
    sequelize,
    tableName: 'career_role_skills',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['career_role_id', 'skill_id'] },
      { fields: ['career_role_id'] },
      { fields: ['skill_id'] },
    ],
  }
);
