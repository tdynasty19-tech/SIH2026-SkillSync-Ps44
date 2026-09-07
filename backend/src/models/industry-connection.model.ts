import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IndustryConnectionAttributes {
  id: number;
  institutionId: number;
  industryId: number;
  connectionType: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  isActive: boolean;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndustryConnectionCreationAttributes
  extends Optional<
    IndustryConnectionAttributes,
    'id' | 'connectionType' | 'endDate' | 'isActive' | 'description' | 'createdAt' | 'updatedAt'
  > {}

export class IndustryConnection
  extends Model<IndustryConnectionAttributes, IndustryConnectionCreationAttributes>
  implements IndustryConnectionAttributes
{
  public id!: number;
  public institutionId!: number;
  public industryId!: number;
  public connectionType!: string;
  public startDate!: string | Date;
  public endDate!: string | Date | null;
  public isActive!: boolean;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

IndustryConnection.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    connectionType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'MOU',
      field: 'connection_type',
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
  },
  {
    sequelize,
    tableName: 'industry_connections',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['institution_id', 'industry_id'] },
      { fields: ['institution_id'] },
      { fields: ['industry_id'] },
    ],
  }
);
