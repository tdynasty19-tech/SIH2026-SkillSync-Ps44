import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { EmploymentType, OpportunityStatus, WorkplaceType } from '../constants/enums';

export interface JobAttributes {
  id: number;
  industryId: number;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: Date | null;
  openings: number;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobCreationAttributes
  extends Optional<
    JobAttributes,
    | 'id'
    | 'requirements'
    | 'location'
    | 'city'
    | 'state'
    | 'workplaceType'
    | 'employmentType'
    | 'salaryMin'
    | 'salaryMax'
    | 'applicationDeadline'
    | 'openings'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public industryId!: number;
  public title!: string;
  public description!: string;
  public requirements!: string | null;
  public location!: string | null;
  public city!: string | null;
  public state!: string | null;
  public workplaceType!: WorkplaceType;
  public employmentType!: EmploymentType;
  public salaryMin!: number | null;
  public salaryMax!: number | null;
  public applicationDeadline!: Date | null;
  public openings!: number;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    industryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'industry_id',
      references: {
        model: 'industry_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'requirements',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'location',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city',
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'state',
    },
    workplaceType: {
      type: DataTypes.ENUM(...Object.values(WorkplaceType)),
      allowNull: false,
      defaultValue: WorkplaceType.ON_SITE,
      field: 'workplace_type',
    },
    employmentType: {
      type: DataTypes.ENUM(...Object.values(EmploymentType)),
      allowNull: false,
      defaultValue: EmploymentType.FULL_TIME,
      field: 'employment_type',
    },
    salaryMin: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'salary_min',
    },
    salaryMax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'salary_max',
    },
    applicationDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'application_deadline',
    },
    openings: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'openings',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OpportunityStatus)),
      allowNull: false,
      defaultValue: OpportunityStatus.OPEN,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['status'] },
      { fields: ['workplace_type'] },
      { fields: ['employment_type'] },
      { fields: ['location'] },
      { fields: ['application_deadline'] },
    ],
  }
);
