import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { StudentSkillLevel } from '../constants/enums';

export interface StudentSkillAttributes {
  id: number;
  studentId: number;
  skillId: number;
  level: StudentSkillLevel;
  score?: number | null;
  yearsOfExperience?: number | null;
  source?: string | null;
  verified: boolean;
  lastAssessedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentSkillCreationAttributes
  extends Optional<
    StudentSkillAttributes,
    'id' | 'score' | 'yearsOfExperience' | 'source' | 'verified' | 'lastAssessedAt' | 'createdAt' | 'updatedAt'
  > {}

export class StudentSkill
  extends Model<StudentSkillAttributes, StudentSkillCreationAttributes>
  implements StudentSkillAttributes
{
  public id!: number;
  public studentId!: number;
  public skillId!: number;
  public level!: StudentSkillLevel;
  public score!: number | null;
  public yearsOfExperience!: number | null;
  public source!: string | null;
  public verified!: boolean;
  public lastAssessedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentSkill.init(
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
    level: {
      type: DataTypes.ENUM(...Object.values(StudentSkillLevel)),
      allowNull: false,
      defaultValue: StudentSkillLevel.BEGINNER,
      field: 'level',
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'score',
    },
    yearsOfExperience: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      field: 'years_of_experience',
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'source',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'verified',
    },
    lastAssessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_assessed_at',
    },
  },
  {
    sequelize,
    tableName: 'student_skills',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['student_id', 'skill_id'] },
      { fields: ['student_id'] },
      { fields: ['skill_id'] },
      { fields: ['level'] },
    ],
  }
);
