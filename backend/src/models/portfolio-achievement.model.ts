import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PortfolioAchievementAttributes {
  id: number;
  portfolioId: number;
  title: string;
  description?: string | null;
  date?: Date | string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioAchievementCreationAttributes
  extends Optional<
    PortfolioAchievementAttributes,
    'id' | 'description' | 'date' | 'order' | 'createdAt' | 'updatedAt'
  > {}

export class PortfolioAchievement
  extends Model<PortfolioAchievementAttributes, PortfolioAchievementCreationAttributes>
  implements PortfolioAchievementAttributes
{
  public id!: number;
  public portfolioId!: number;
  public title!: string;
  public description!: string | null;
  public date!: Date | string | null;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PortfolioAchievement.init(
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
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date',
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
    tableName: 'portfolio_achievements',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['portfolio_id'] }],
  }
);
