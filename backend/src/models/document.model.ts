import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { DocumentAccessLevel } from '../constants/enums';

export interface DocumentAttributes {
  id: number;
  ownerUserId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  accessLevel: DocumentAccessLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, 'id' | 'accessLevel' | 'createdAt' | 'updatedAt'> {}

export class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  public id!: number;
  public ownerUserId!: number;
  public fileName!: string;
  public fileUrl!: string;
  public fileType!: string;
  public fileSizeBytes!: number;
  public accessLevel!: DocumentAccessLevel;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    ownerUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'owner_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileUrl: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      field: 'file_url',
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'file_type',
    },
    fileSizeBytes: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'file_size_bytes',
    },
    accessLevel: {
      type: DataTypes.ENUM(...Object.values(DocumentAccessLevel)),
      allowNull: false,
      defaultValue: DocumentAccessLevel.PRIVATE,
      field: 'access_level',
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['owner_user_id'] },
      { fields: ['access_level'] },
    ],
  }
);
