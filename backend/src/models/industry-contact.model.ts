import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IndustryContactAttributes {
  id: number;
  industryId: number;
  name: string;
  designation?: string | null;
  email: string;
  phone?: string | null;
  isPrimary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndustryContactCreationAttributes
  extends Optional<
    IndustryContactAttributes,
    'id' | 'designation' | 'phone' | 'isPrimary' | 'createdAt' | 'updatedAt'
  > {}

export class IndustryContact
  extends Model<IndustryContactAttributes, IndustryContactCreationAttributes>
  implements IndustryContactAttributes
{
  public id!: number;
  public industryId!: number;
  public name!: string;
  public designation!: string | null;
  public email!: string;
  public phone!: string | null;
  public isPrimary!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

IndustryContact.init(
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
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'contact_name',
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'designation',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'email',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone',
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary',
    },
  },
  {
    sequelize,
    tableName: 'industry_contacts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['email'] },
    ],
  }
);
