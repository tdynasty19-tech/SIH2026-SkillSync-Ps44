import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IndustryProfileAttributes {
  id: number;
  userId: number;
  companyName: string;
  cin?: string | null;
  industryType: string;
  websiteUrl?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  description?: string | null;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndustryProfileCreationAttributes
  extends Optional<
    IndustryProfileAttributes,
    | 'id'
    | 'cin'
    | 'websiteUrl'
    | 'location'
    | 'city'
    | 'state'
    | 'country'
    | 'description'
    | 'verified'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class IndustryProfile
  extends Model<IndustryProfileAttributes, IndustryProfileCreationAttributes>
  implements IndustryProfileAttributes
{
  public id!: number;
  public userId!: number;
  public companyName!: string;
  public cin!: string | null;
  public industryType!: string;
  public websiteUrl!: string | null;
  public location!: string | null;
  public city!: string | null;
  public state!: string | null;
  public country!: string | null;
  public description!: string | null;
  public verified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

IndustryProfile.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
    },
    cin: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'cin',
    },
    industryType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'industry_type',
    },
    websiteUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'website_url',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'location',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city',
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'state',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'India',
      field: 'country',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'verified',
    },
  },
  {
    sequelize,
    tableName: 'industry_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id'] },
      { fields: ['company_name'] },
      { fields: ['industry_type'] },
      { fields: ['location'] },
      { fields: ['city'] },
    ],
  }
);
