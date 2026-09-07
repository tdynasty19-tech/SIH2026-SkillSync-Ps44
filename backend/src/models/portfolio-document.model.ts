import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PortfolioDocumentAttributes {
  id: number;
  portfolioId: number;
  name: string;
  documentUrl: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioDocumentCreationAttributes
  extends Optional<PortfolioDocumentAttributes, 'id' | 'order' | 'createdAt' | 'updatedAt'> {}

export class PortfolioDocument
  extends Model<PortfolioDocumentAttributes, PortfolioDocumentCreationAttributes>
  implements PortfolioDocumentAttributes
{
  public id!: number;
  public portfolioId!: number;
  public name!: string;
  public documentUrl!: string;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PortfolioDocument.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'name',
    },
    documentUrl: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      field: 'document_url',
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
    tableName: 'portfolio_documents',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['portfolio_id'] },
    ],
  }
);
