import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CollaborationStatus, CollaborationType } from '../constants/enums';

export interface CollaborationAttributes {
  id: number;
  industryId: number;
  institutionId: number;
  title: string;
  collaborationType: CollaborationType;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  status: CollaborationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollaborationCreationAttributes
  extends Optional<
    CollaborationAttributes,
    'id' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class Collaboration
  extends Model<CollaborationAttributes, CollaborationCreationAttributes>
  implements CollaborationAttributes
{
  public id!: number;
  public industryId!: number;
  public institutionId!: number;
  public title!: string;
  public collaborationType!: CollaborationType;
  public description!: string;
  public startDate!: string | Date;
  public endDate!: string | Date;
  public status!: CollaborationStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Collaboration.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title',
    },
    collaborationType: {
      type: DataTypes.ENUM(...Object.values(CollaborationType)),
      allowNull: false,
      field: 'collaboration_type',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CollaborationStatus)),
      allowNull: false,
      defaultValue: CollaborationStatus.PENDING,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'collaborations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['institution_id'] },
      { fields: ['collaboration_type'] },
      { fields: ['status'] },
    ],
  }
);
