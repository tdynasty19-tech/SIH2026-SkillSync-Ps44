import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentExperienceAttributes {
  id: number;
  studentId: number;
  title: string;
  companyName: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentExperienceCreationAttributes
  extends Optional<
    StudentExperienceAttributes,
    'id' | 'location' | 'endDate' | 'isCurrent' | 'description' | 'createdAt' | 'updatedAt'
  > {}

export class StudentExperience
  extends Model<StudentExperienceAttributes, StudentExperienceCreationAttributes>
  implements StudentExperienceAttributes
{
  public id!: number;
  public studentId!: number;
  public title!: string;
  public companyName!: string;
  public location!: string | null;
  public startDate!: Date;
  public endDate!: Date | null;
  public isCurrent!: boolean;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentExperience.init(
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
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'title',
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'location',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_current',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
  },
  {
    sequelize,
    tableName: 'student_experiences',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['student_id'] }],
  }
);
