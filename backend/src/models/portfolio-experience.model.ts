import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PortfolioExperienceAttributes {
  id: number;
  portfolioId: number;
  title: string;
  organization: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  description?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioExperienceCreationAttributes
  extends Optional<
    PortfolioExperienceAttributes,
    'id' | 'endDate' | 'description' | 'order' | 'createdAt' | 'updatedAt'
  > {}

export class PortfolioExperience
  extends Model<PortfolioExperienceAttributes, PortfolioExperienceCreationAttributes>
  implements PortfolioExperienceAttributes
{
  public id!: number;
  public portfolioId!: number;
  public title!: string;
  public organization!: string;
  public startDate!: Date | string;
  public endDate!: Date | string | null;
  public description!: string | null;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PortfolioExperience.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    portfolioId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'portfolio_id',
      references: {
        model: 'portfolios',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'title',
    },
    organization: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'organization',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'order',
    },
  },
  {
    sequelize,
    tableName: 'portfolio_experiences',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['portfolio_id'] }],
  }
);
