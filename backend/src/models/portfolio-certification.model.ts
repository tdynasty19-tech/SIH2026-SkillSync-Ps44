import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PortfolioCertificationAttributes {
  id: number;
  portfolioId: number;
  title: string;
  issuer: string;
  issueDate: Date | string;
  credentialUrl?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioCertificationCreationAttributes
  extends Optional<
    PortfolioCertificationAttributes,
    'id' | 'credentialUrl' | 'order' | 'createdAt' | 'updatedAt'
  > {}

export class PortfolioCertification
  extends Model<PortfolioCertificationAttributes, PortfolioCertificationCreationAttributes>
  implements PortfolioCertificationAttributes
{
  public id!: number;
  public portfolioId!: number;
  public title!: string;
  public issuer!: string;
  public issueDate!: Date | string;
  public credentialUrl!: string | null;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PortfolioCertification.init(
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
    issuer: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'issuer',
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'issue_date',
    },
    credentialUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'credential_url',
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
    tableName: 'portfolio_certifications',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['portfolio_id'] }],
  }
);
