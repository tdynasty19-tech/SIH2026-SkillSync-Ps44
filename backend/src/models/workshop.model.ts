import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WorkshopAttributes {
  id: number;
  collaborationId: number;
  topic: string;
  speakerName: string;
  speakerDesignation?: string | null;
  date: string | Date;
  durationHours: number;
  venue?: string | null;
  attendeesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkshopCreationAttributes
  extends Optional<
    WorkshopAttributes,
    'id' | 'speakerDesignation' | 'durationHours' | 'venue' | 'attendeesCount' | 'createdAt' | 'updatedAt'
  > {}

export class Workshop
  extends Model<WorkshopAttributes, WorkshopCreationAttributes>
  implements WorkshopAttributes
{
  public id!: number;
  public collaborationId!: number;
  public topic!: string;
  public speakerName!: string;
  public speakerDesignation!: string | null;
  public date!: string | Date;
  public durationHours!: number;
  public venue!: string | null;
  public attendeesCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Workshop.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    collaborationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaboration_id',
      references: {
        model: 'collaborations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    topic: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'topic',
    },
    speakerName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'speaker_name',
    },
    speakerDesignation: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'speaker_designation',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date',
    },
    durationHours: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'duration_hours',
    },
    venue: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'venue',
    },
    attendeesCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'attendees_count',
    },
  },
  {
    sequelize,
    tableName: 'workshops',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['collaboration_id'] }],
  }
);
