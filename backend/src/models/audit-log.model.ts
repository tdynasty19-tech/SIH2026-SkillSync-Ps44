import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AuditLogAttributes {
  id: number;
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: object | null;
  createdAt?: Date;
}

export interface AuditLogCreationAttributes
  extends Optional<
    AuditLogAttributes,
    'id' | 'userId' | 'entityId' | 'ipAddress' | 'userAgent' | 'metadata' | 'createdAt'
  > {}

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  public id!: number;
  public userId!: number | null;
  public action!: string;
  public entityType!: string;
  public entityId!: number | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public metadata!: object | null;
  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'action',
    },
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'entity_id',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'metadata',
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs are immutable, created_at only
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['entity_type'] },
      { fields: ['created_at'] },
    ],
  }
);
