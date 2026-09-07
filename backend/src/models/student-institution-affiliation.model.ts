import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { StudentAffiliationStatus } from '../constants/enums';

export interface StudentInstitutionAffiliationAttributes {
  id: number;
  studentId: number;
  institutionId: number;
  departmentId: number;
  enrollmentNumber: string;
  status: StudentAffiliationStatus;
  requestedAt: Date;
  reviewedAt?: Date | null;
  reviewedByUserId?: number | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentInstitutionAffiliationCreationAttributes
  extends Optional<
    StudentInstitutionAffiliationAttributes,
    'id' | 'status' | 'requestedAt' | 'reviewedAt' | 'reviewedByUserId' | 'rejectionReason' | 'createdAt' | 'updatedAt'
  > {}

export class StudentInstitutionAffiliation
  extends Model<
    StudentInstitutionAffiliationAttributes,
    StudentInstitutionAffiliationCreationAttributes
  >
  implements StudentInstitutionAffiliationAttributes
{
  public id!: number;
  public studentId!: number;
  public institutionId!: number;
  public departmentId!: number;
  public enrollmentNumber!: string;
  public status!: StudentAffiliationStatus;
  public requestedAt!: Date;
  public reviewedAt!: Date | null;
  public reviewedByUserId!: number | null;
  public rejectionReason!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentInstitutionAffiliation.init(
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
      references: { model: 'student_profiles', key: 'id' },
      onDelete: 'CASCADE',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'institution_id',
      references: { model: 'institution_profiles', key: 'id' },
      onDelete: 'CASCADE',
    },
    departmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'department_id',
      references: { model: 'institution_departments', key: 'id' },
      onDelete: 'RESTRICT',
    },
    enrollmentNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'enrollment_number',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StudentAffiliationStatus)),
      allowNull: false,
      defaultValue: StudentAffiliationStatus.PENDING,
      field: 'status',
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'requested_at',
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at',
    },
    reviewedByUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'reviewed_by_user_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    rejectionReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'rejection_reason',
    },
  },
  {
    sequelize,
    tableName: 'student_institution_affiliations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id', 'status'] },
      { fields: ['student_id', 'status'] },
      { unique: true, fields: ['institution_id', 'enrollment_number'] },
      { fields: ['department_id'] },
    ],
  }
);
