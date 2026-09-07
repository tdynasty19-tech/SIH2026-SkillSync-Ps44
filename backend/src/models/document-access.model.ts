import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface DocumentAccessAttributes {
  id: number;
  documentId: number;
  granteeUserId: number;
  canView: boolean;
  canEdit: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentAccessCreationAttributes
  extends Optional<
    DocumentAccessAttributes,
    'id' | 'canView' | 'canEdit' | 'createdAt' | 'updatedAt'
  > {}

export class DocumentAccess
  extends Model<DocumentAccessAttributes, DocumentAccessCreationAttributes>
  implements DocumentAccessAttributes
{
  public id!: number;
  public documentId!: number;
  public granteeUserId!: number;
  public canView!: boolean;
  public canEdit!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DocumentAccess.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    documentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'document_id',
      references: {
        model: 'documents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    granteeUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'grantee_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    canView: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'can_view',
    },
    canEdit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'can_edit',
    },
  },
  {
    sequelize,
    tableName: 'document_access',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['document_id', 'grantee_user_id'] },
      { fields: ['document_id'] },
      { fields: ['grantee_user_id'] },
    ],
  }
);
