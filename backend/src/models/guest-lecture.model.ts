import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GuestLectureAttributes {
  id: number;
  collaborationId: number;
  topic: string;
  lecturerName: string;
  date: string | Date;
  durationMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GuestLectureCreationAttributes
  extends Optional<
    GuestLectureAttributes,
    'id' | 'durationMinutes' | 'createdAt' | 'updatedAt'
  > {}

export class GuestLecture
  extends Model<GuestLectureAttributes, GuestLectureCreationAttributes>
  implements GuestLectureAttributes
{
  public id!: number;
  public collaborationId!: number;
  public topic!: string;
  public lecturerName!: string;
  public date!: string | Date;
  public durationMinutes!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GuestLecture.init(
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
    lecturerName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'lecturer_name',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date',
    },
    durationMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 60,
      field: 'duration_minutes',
    },
  },
  {
    sequelize,
    tableName: 'guest_lectures',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['collaboration_id'] }],
  }
);
