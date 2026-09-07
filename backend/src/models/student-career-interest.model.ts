import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentCareerInterestAttributes {
  id: number;
  studentId: number;
  careerRoleId: number;
  priorityOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentCareerInterestCreationAttributes
  extends Optional<StudentCareerInterestAttributes, 'id' | 'priorityOrder' | 'createdAt' | 'updatedAt'> {}

export class StudentCareerInterest
  extends Model<StudentCareerInterestAttributes, StudentCareerInterestCreationAttributes>
  implements StudentCareerInterestAttributes
{
  public id!: number;
  public studentId!: number;
  public careerRoleId!: number;
  public priorityOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentCareerInterest.init(
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
    priorityOrder: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'priority_order',
    },
  },
  {
    sequelize,
    tableName: 'student_career_interests',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['student_id', 'career_role_id'] },
      { fields: ['student_id'] },
      { fields: ['career_role_id'] },
    ],
  }
);
