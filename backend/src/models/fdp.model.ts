import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus } from '../constants/enums';

export interface FDPAttributes {
  id: number;
  institutionId?: number | null;
  industryId?: number | null;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  mode: string;
  venue?: string | null;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FDPCreationAttributes
  extends Optional<
    FDPAttributes,
    'id' | 'institutionId' | 'industryId' | 'mode' | 'venue' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class FDP extends Model<FDPAttributes, FDPCreationAttributes> implements FDPAttributes {
  public id!: number;
  public institutionId!: number | null;
  public industryId!: number | null;
  public title!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public mode!: string;
  public venue!: string | null;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FDP.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    industryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'industry_id',
      references: {
        model: 'industry_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    mode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ONLINE',
      field: 'mode',
    },
    venue: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'venue',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OpportunityStatus)),
      allowNull: false,
      defaultValue: OpportunityStatus.OPEN,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'fdps',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { fields: ['industry_id'] },
      { fields: ['status'] },
    ],
  }
);
