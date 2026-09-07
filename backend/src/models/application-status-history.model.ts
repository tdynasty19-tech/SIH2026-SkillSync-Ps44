import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ApplicationStatus } from '../constants/enums';

export interface ApplicationStatusHistoryAttributes {
  id: number;
  applicationId: number;
  fromStatus?: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedByUserId?: number | null;
  reason?: string | null;
  createdAt?: Date;
}

export interface ApplicationStatusHistoryCreationAttributes
  extends Optional<
    ApplicationStatusHistoryAttributes,
    'id' | 'fromStatus' | 'changedByUserId' | 'reason' | 'createdAt'
  > {}

export class ApplicationStatusHistory
  extends Model<ApplicationStatusHistoryAttributes, ApplicationStatusHistoryCreationAttributes>
  implements ApplicationStatusHistoryAttributes
{
  public id!: number;
  public applicationId!: number;
  public fromStatus!: ApplicationStatus | null;
  public toStatus!: ApplicationStatus;
  public changedByUserId!: number | null;
  public reason!: string | null;
  public readonly createdAt!: Date;
}

ApplicationStatusHistory.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    applicationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fromStatus: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
      allowNull: true,
      field: 'from_status',
    },
    toStatus: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
      allowNull: false,
      field: 'to_status',
    },
    changedByUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'changed_by_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reason',
    },
  },
  {
    sequelize,
    tableName: 'application_status_histories',
    timestamps: true,
    updatedAt: false, // Only created_at for history records
    underscored: true,
    indexes: [
      { fields: ['application_id'] },
      { fields: ['changed_by_user_id'] },
    ],
  }
);
