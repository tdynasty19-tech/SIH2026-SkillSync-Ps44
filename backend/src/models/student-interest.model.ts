import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentInterestAttributes {
  id: number;
  studentId: number;
  interestArea: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentInterestCreationAttributes
  extends Optional<StudentInterestAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class StudentInterest
  extends Model<StudentInterestAttributes, StudentInterestCreationAttributes>
  implements StudentInterestAttributes
{
  public id!: number;
  public studentId!: number;
  public interestArea!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentInterest.init(
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
    interestArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'interest_name',
    },
  },
  {
    sequelize,
    tableName: 'student_interests',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['student_id'] }],
  }
);
