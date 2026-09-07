import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PortfolioProjectAttributes {
  id: number;
  portfolioId: number;
  title: string;
  description: string;
  role?: string | null;
  technologies?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioProjectCreationAttributes
  extends Optional<
    PortfolioProjectAttributes,
    'id' | 'role' | 'technologies' | 'projectUrl' | 'githubUrl' | 'order' | 'createdAt' | 'updatedAt'
  > {}

export class PortfolioProject
  extends Model<PortfolioProjectAttributes, PortfolioProjectCreationAttributes>
  implements PortfolioProjectAttributes
{
  public id!: number;
  public portfolioId!: number;
  public title!: string;
  public description!: string;
  public role!: string | null;
  public technologies!: string | null;
  public projectUrl!: string | null;
  public githubUrl!: string | null;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PortfolioProject.init(
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
      allowNull: false,
      field: 'description',
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'role',
    },
    technologies: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'technologies',
    },
    projectUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'project_url',
    },
    githubUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'github_url',
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
    tableName: 'portfolio_projects',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['portfolio_id'] }],
  }
);
