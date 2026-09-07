import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PlacementRecordAttributes {
  id: number;
  placementId: number;
  studentId?: number | null;
  companyName: string;
  packageOffered: number;
  roleOffered: string;
  offerDate?: string | Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlacementRecordCreationAttributes
  extends Optional<
    PlacementRecordAttributes,
    'id' | 'studentId' | 'offerDate' | 'createdAt' | 'updatedAt'
  > {}

export class PlacementRecord
  extends Model<PlacementRecordAttributes, PlacementRecordCreationAttributes>
  implements PlacementRecordAttributes
{
  public id!: number;
  public placementId!: number;
  public studentId!: number | null;
  public companyName!: string;
  public packageOffered!: number;
  public roleOffered!: string;
  public offerDate!: string | Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlacementRecord.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    placementId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'placement_id',
      references: {
        model: 'placements',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'student_id',
      references: {
        model: 'student_profiles',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
    },
    packageOffered: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'package_offered',
    },
    roleOffered: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'role_offered',
    },
    offerDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'offer_date',
    },
  },
  {
    sequelize,
    tableName: 'placement_records',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['placement_id'] },
      { fields: ['student_id'] },
    ],
  }
);
