import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus, WorkplaceType } from '../constants/enums';

export interface InternshipAttributes {
  id: number;
  industryId: number;
  title: string;
  description: string;
  requirements?: string | null;
  durationMonths: number;
  stipend?: number | null;
  workplaceType: WorkplaceType;
  location?: string | null;
  openings: number;
  applicationDeadline?: Date | null;
  startDate?: Date | null;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InternshipCreationAttributes
  extends Optional<
    InternshipAttributes,
    | 'id'
    | 'requirements'
    | 'durationMonths'
    | 'stipend'
    | 'workplaceType'
    | 'location'
    | 'openings'
    | 'applicationDeadline'
    | 'startDate'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Internship
  extends Model<InternshipAttributes, InternshipCreationAttributes>
  implements InternshipAttributes
{
  public id!: number;
  public industryId!: number;
  public title!: string;
  public description!: string;
  public requirements!: string | null;
  public durationMonths!: number;
  public stipend!: number | null;
  public workplaceType!: WorkplaceType;
  public location!: string | null;
  public openings!: number;
  public applicationDeadline!: Date | null;
  public startDate!: Date | null;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Internship.init(
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
    durationMonths: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 3,
      field: 'duration_months',
    },
    stipend: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'stipend',
    },
    workplaceType: {
      type: DataTypes.ENUM(...Object.values(WorkplaceType)),
      allowNull: false,
      defaultValue: WorkplaceType.ON_SITE,
      field: 'workplace_type',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'location',
    },
    openings: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'openings',
    },
    applicationDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'application_deadline',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date',
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
    tableName: 'internships',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['status'] },
      { fields: ['location'] },
      { fields: ['application_deadline'] },
    ],
  }
);
