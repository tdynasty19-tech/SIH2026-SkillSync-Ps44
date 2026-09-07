import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus } from '../constants/enums';

export interface ResearchOpportunityAttributes {
  id: number;
  institutionId?: number | null;
  industryId?: number | null;
  title: string;
  fieldOfStudy: string;
  description: string;
  fundingAmount?: number | null;
  durationMonths?: number | null;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResearchOpportunityCreationAttributes
  extends Optional<
    ResearchOpportunityAttributes,
    'id' | 'institutionId' | 'industryId' | 'fundingAmount' | 'durationMonths' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class ResearchOpportunity
  extends Model<ResearchOpportunityAttributes, ResearchOpportunityCreationAttributes>
  implements ResearchOpportunityAttributes
{
  public id!: number;
  public institutionId!: number | null;
  public industryId!: number | null;
  public title!: string;
  public fieldOfStudy!: string;
  public description!: string;
  public fundingAmount!: number | null;
  public durationMonths!: number | null;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ResearchOpportunity.init(
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
    fieldOfStudy: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'field_of_study',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
    },
    fundingAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'funding_amount',
    },
    durationMonths: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'duration_months',
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
    tableName: 'research_opportunities',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { fields: ['industry_id'] },
      { fields: ['status'] },
    ],
  }
);
