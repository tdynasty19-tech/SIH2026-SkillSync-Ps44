import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface InstitutionProfileAttributes {
  id: number;
  userId: number;
  institutionName: string;
  aisheCode?: string | null;
  institutionType: string;
  affiliation?: string | null;
  accreditation?: string | null;
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

export interface InstitutionProfileCreationAttributes
  extends Optional<
    InstitutionProfileAttributes,
    | 'id'
    | 'aisheCode'
    | 'affiliation'
    | 'accreditation'
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

export class InstitutionProfile
  extends Model<InstitutionProfileAttributes, InstitutionProfileCreationAttributes>
  implements InstitutionProfileAttributes
{
  public id!: number;
  public userId!: number;
  public institutionName!: string;
  public aisheCode!: string | null;
  public institutionType!: string;
  public affiliation!: string | null;
  public accreditation!: string | null;
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

InstitutionProfile.init(
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
    institutionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'institution_name',
    },
    aisheCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'aishe_code',
    },
    institutionType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'institution_type',
    },
    affiliation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'affiliation',
    },
    accreditation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'accreditation',
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
    tableName: 'institution_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id'] },
      { fields: ['institution_name'] },
      { fields: ['institution_type'] },
      { fields: ['city'] },
    ],
  }
);
