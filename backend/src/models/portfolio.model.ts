import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PortfolioAttributes {
  id: number;
  studentId: number;
  customDomain?: string | null;
  theme: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioCreationAttributes
  extends Optional<
    PortfolioAttributes,
    'id' | 'customDomain' | 'theme' | 'isPublished' | 'publishedAt' | 'createdAt' | 'updatedAt'
  > {}

export class Portfolio
  extends Model<PortfolioAttributes, PortfolioCreationAttributes>
  implements PortfolioAttributes
{
  public id!: number;
  public studentId!: number;
  public customDomain!: string | null;
  public theme!: string;
  public isPublished!: boolean;
  public publishedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Portfolio.init(
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
      unique: true,
      field: 'student_id',
      references: {
        model: 'student_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    customDomain: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'custom_domain',
    },
    theme: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'modern',
      field: 'theme',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_published',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
    },
  },
  {
    sequelize,
    tableName: 'portfolios',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['student_id'] },
      { unique: true, fields: ['custom_domain'] },
    ],
  }
);
