import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { EnrollmentStatus } from '../constants/enums';

export interface StudentAcademicEnrollmentAttributes {
  id: number;
  studentId: number;
  institutionId: number;
  departmentId: number;
  programId: number;
  batchId: number;
  enrollmentNumber: string;
  rollNumber?: string | null;
  status: EnrollmentStatus;
  currentSemester: number;
  isCurrent: boolean;
  enrolledAt: Date;
  completedAt?: Date | null;
  student?: any;
  institution?: any;
  department?: any;
  program?: any;
  batch?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentAcademicEnrollmentCreationAttributes
  extends Optional<
    StudentAcademicEnrollmentAttributes,
    | 'id'
    | 'rollNumber'
    | 'status'
    | 'currentSemester'
    | 'isCurrent'
    | 'enrolledAt'
    | 'completedAt'
    | 'student'
    | 'institution'
    | 'department'
    | 'program'
    | 'batch'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class StudentAcademicEnrollment
  extends Model<
    StudentAcademicEnrollmentAttributes,
    StudentAcademicEnrollmentCreationAttributes
  >
  implements StudentAcademicEnrollmentAttributes
{
  public id!: number;
  public studentId!: number;
  public institutionId!: number;
  public departmentId!: number;
  public programId!: number;
  public batchId!: number;
  public enrollmentNumber!: string;
  public rollNumber!: string | null;
  public status!: EnrollmentStatus;
  public currentSemester!: number;
  public isCurrent!: boolean;
  public enrolledAt!: Date;
  public completedAt!: Date | null;
  public student?: any;
  public institution?: any;
  public department?: any;
  public program?: any;
  public batch?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentAcademicEnrollment.init(
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
    batchId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'batch_id',
      references: {
        model: 'academic_batches',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    enrollmentNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'enrollment_number',
    },
    rollNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'roll_number',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EnrollmentStatus)),
      allowNull: false,
      defaultValue: EnrollmentStatus.ACTIVE,
      field: 'status',
    },
    currentSemester: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'current_semester',
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_current',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'enrolled_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  },
  {
    sequelize,
    tableName: 'student_academic_enrollments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['batch_id'] },
      { fields: ['institution_id'] },
      { fields: ['program_id'] },
      { unique: true, fields: ['batch_id', 'student_id'] },
    ],
  }
);
