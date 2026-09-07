import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus } from '../constants/enums';

export interface FacultyOpportunityAttributes {
  id: number;
  institutionId?: number | null;
  industryId?: number | null;
  title: string;
  description: string;
  department: string;
  eligibility?: string | null;
  applicationDeadline?: Date | null;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FacultyOpportunityCreationAttributes
  extends Optional<
    FacultyOpportunityAttributes,
    'id' | 'institutionId' | 'industryId' | 'eligibility' | 'applicationDeadline' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class FacultyOpportunity
  extends Model<FacultyOpportunityAttributes, FacultyOpportunityCreationAttributes>
  implements FacultyOpportunityAttributes
{
  public id!: number;
  public institutionId!: number | null;
  public industryId!: number | null;
  public title!: string;
  public description!: string;
  public department!: string;
  public eligibility!: string | null;
  public applicationDeadline!: Date | null;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FacultyOpportunity.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
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
    industryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'industry_id',
      references: {
        model: 'industry_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'department',
    },
    eligibility: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'eligibility',
    },
    applicationDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'application_deadline',
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
    tableName: 'faculty_opportunities',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { fields: ['industry_id'] },
      { fields: ['department'] },
      { fields: ['application_deadline'] },
      { fields: ['status'] },
    ],
  }
);
