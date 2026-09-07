import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentEducationAttributes {
  id: number;
  studentId: number;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
  grade?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentEducationCreationAttributes
  extends Optional<
    StudentEducationAttributes,
    'id' | 'endYear' | 'grade' | 'description' | 'createdAt' | 'updatedAt'
  > {}

export class StudentEducation
  extends Model<StudentEducationAttributes, StudentEducationCreationAttributes>
  implements StudentEducationAttributes
{
  public id!: number;
  public studentId!: number;
  public institutionName!: string;
  public degree!: string;
  public fieldOfStudy!: string;
  public startYear!: number;
  public endYear!: number | null;
  public grade!: string | null;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentEducation.init(
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
    institutionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'institution_name',
    },
    degree: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'degree',
    },
    fieldOfStudy: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'field_of_study',
    },
    startYear: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      field: 'start_year',
    },
    endYear: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      field: 'end_year',
    },
    grade: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'grade',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
  },
  {
    sequelize,
    tableName: 'student_education',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['student_id'] },
    ],
  }
);
