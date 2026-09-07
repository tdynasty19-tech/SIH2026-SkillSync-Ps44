import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AcademicianProfileAttributes {
  id: number;
  userId: number;
  institutionId?: number | null;
  departmentId?: number | null;
  department?: string | null;
  designation: string;
  qualification?: string | null;
  specialization?: string | null;
  experienceYears?: number | null;
  bio?: string | null;
  researchInterests?: string | null;
  publications?: string | null;
  linkedinUrl?: string | null;
  googleScholarUrl?: string | null;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AcademicianProfileCreationAttributes
  extends Optional<
    AcademicianProfileAttributes,
    | 'id'
    | 'institutionId'
    | 'departmentId'
    | 'department'
    | 'qualification'
    | 'specialization'
    | 'experienceYears'
    | 'bio'
    | 'researchInterests'
    | 'publications'
    | 'linkedinUrl'
    | 'googleScholarUrl'
    | 'verified'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class AcademicianProfile
  extends Model<AcademicianProfileAttributes, AcademicianProfileCreationAttributes>
  implements AcademicianProfileAttributes
{
  public id!: number;
  public userId!: number;
  public institutionId!: number | null;
  public departmentId!: number | null;
  public department!: string | null;
  public designation!: string;
  public qualification!: string | null;
  public specialization!: string | null;
  public experienceYears!: number | null;
  public bio!: string | null;
  public researchInterests!: string | null;
  public publications!: string | null;
  public linkedinUrl!: string | null;
  public googleScholarUrl!: string | null;
  public verified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AcademicianProfile.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    departmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'department_id',
      references: {
        model: 'institution_departments',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'department',
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'designation',
    },
    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'qualification',
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'specialization',
    },
    experienceYears: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      field: 'experience_years',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bio',
    },
    researchInterests: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'research_interests',
    },
    publications: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'publications',
    },
    linkedinUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'linkedin_url',
    },
    googleScholarUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'google_scholar_url',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'verified',
    },
  },
  {
    sequelize,
    tableName: 'academician_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id'] },
      { fields: ['institution_id'] },
      { fields: ['department_id'] },
      { fields: ['department'] },
    ],
  }
);
