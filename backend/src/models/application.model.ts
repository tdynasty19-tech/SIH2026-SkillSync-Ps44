import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ApplicationStatus } from '../constants/enums';

export interface ApplicationAttributes {
  id: number;
  studentId: number;
  opportunityId: number;
  opportunityType: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  matchScore?: number | null;
  appliedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicationCreationAttributes
  extends Optional<
    ApplicationAttributes,
    'id' | 'status' | 'coverLetter' | 'resumeUrl' | 'matchScore' | 'appliedAt' | 'createdAt' | 'updatedAt'
  > {}

export class Application
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes
{
  public id!: number;
  public studentId!: number;
  public opportunityId!: number;
  public opportunityType!: string;
  public status!: ApplicationStatus;
  public coverLetter!: string | null;
  public resumeUrl!: string | null;
  public matchScore!: number | null;
  public appliedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Application.init(
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
      onDelete: 'RESTRICT',
    },
    opportunityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'opportunity_id',
    },
    opportunityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'opportunity_type',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
      allowNull: false,
      defaultValue: ApplicationStatus.APPLIED,
      field: 'status',
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cover_letter',
    },
    resumeUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'resume_url',
    },
    matchScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'match_score',
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'applied_at',
    },
  },
  {
    sequelize,
    tableName: 'applications',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['student_id', 'opportunity_id', 'opportunity_type'] },
      { fields: ['student_id'] },
      { fields: ['opportunity_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  }
);
