import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { DegreeLevel } from '../constants/enums';

export interface AcademicProgramAttributes {
  id: number;
  institutionId: number;
  departmentId: number;
  programName: string;
  programCode?: string | null;
  degreeLevel: DegreeLevel;
  durationYears: number;
  totalSemesters: number;
  description?: string | null;
  isActive: boolean;
  department?: any;
  institution?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AcademicProgramCreationAttributes
  extends Optional<
    AcademicProgramAttributes,
    | 'id'
    | 'programCode'
    | 'degreeLevel'
    | 'durationYears'
    | 'totalSemesters'
    | 'description'
    | 'isActive'
    | 'department'
    | 'institution'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class AcademicProgram
  extends Model<AcademicProgramAttributes, AcademicProgramCreationAttributes>
  implements AcademicProgramAttributes
{
  public id!: number;
  public institutionId!: number;
  public departmentId!: number;
  public programName!: string;
  public programCode!: string | null;
  public degreeLevel!: DegreeLevel;
  public durationYears!: number;
  public totalSemesters!: number;
  public description!: string | null;
  public isActive!: boolean;
  public department?: any;
  public institution?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AcademicProgram.init(
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
    departmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'department_id',
      references: {
        model: 'institution_departments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    programName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'program_name',
    },
    programCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'program_code',
    },
    degreeLevel: {
      type: DataTypes.ENUM(...Object.values(DegreeLevel)),
      allowNull: false,
      defaultValue: DegreeLevel.UNDERGRADUATE,
      field: 'degree_level',
    },
    durationYears: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 4.0,
      field: 'duration_years',
    },
    totalSemesters: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 8,
      field: 'total_semesters',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
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
    tableName: 'academic_programs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { fields: ['department_id'] },
      { fields: ['institution_id', 'department_id'] },
      { unique: true, fields: ['department_id', 'program_name'] },
    ],
  }
);
