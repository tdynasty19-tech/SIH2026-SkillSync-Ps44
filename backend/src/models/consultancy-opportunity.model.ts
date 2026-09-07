import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus } from '../constants/enums';

export interface ConsultancyOpportunityAttributes {
  id: number;
  industryId: number;
  title: string;
  domain: string;
  problemStatement: string;
  expectedOutcome?: string | null;
  budget?: number | null;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsultancyOpportunityCreationAttributes
  extends Optional<
    ConsultancyOpportunityAttributes,
    'id' | 'expectedOutcome' | 'budget' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class ConsultancyOpportunity
  extends Model<ConsultancyOpportunityAttributes, ConsultancyOpportunityCreationAttributes>
  implements ConsultancyOpportunityAttributes
{
  public id!: number;
  public industryId!: number;
  public title!: string;
  public domain!: string;
  public problemStatement!: string;
  public expectedOutcome!: string | null;
  public budget!: number | null;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsultancyOpportunity.init(
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
    domain: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'domain',
    },
    problemStatement: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'problem_statement',
    },
    expectedOutcome: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'expected_outcome',
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'budget',
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
    tableName: 'consultancy_opportunities',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['status'] },
    ],
  }
);
