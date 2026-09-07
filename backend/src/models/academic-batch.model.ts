import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AcademicBatchAttributes {
  id: number;
  institutionId: number;
  departmentId: number;
  programId: number;
  batchName: string;
  startYear: number;
  endYear: number;
  currentSemester: number;
  isActive: boolean;
  institution?: any;
  department?: any;
  program?: any;
  enrollments?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AcademicBatchCreationAttributes
  extends Optional<
    AcademicBatchAttributes,
    | 'id'
    | 'currentSemester'
    | 'isActive'
    | 'institution'
    | 'department'
    | 'program'
    | 'enrollments'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class AcademicBatch
  extends Model<AcademicBatchAttributes, AcademicBatchCreationAttributes>
  implements AcademicBatchAttributes
{
  public id!: number;
  public institutionId!: number;
  public departmentId!: number;
  public programId!: number;
  public batchName!: string;
  public startYear!: number;
  public endYear!: number;
  public currentSemester!: number;
  public isActive!: boolean;
  public institution?: any;
  public department?: any;
  public program?: any;
  public enrollments?: any[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AcademicBatch.init(
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
    programId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'program_id',
      references: {
        model: 'academic_programs',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    batchName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'batch_name',
    },
    startYear: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'start_year',
    },
    endYear: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'end_year',
    },
    currentSemester: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'current_semester',
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
    tableName: 'academic_batches',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { fields: ['department_id'] },
      { fields: ['program_id'] },
      { unique: true, fields: ['program_id', 'batch_name'] },
    ],
  }
);
