import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MentorAttributes {
  id: number;
  userId: number;
  expertiseAreas: string;
  maxMentees: number;
  currentMentees: number;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MentorCreationAttributes
  extends Optional<MentorAttributes, 'id' | 'maxMentees' | 'currentMentees' | 'isAvailable' | 'createdAt' | 'updatedAt'> {}

export class Mentor
  extends Model<MentorAttributes, MentorCreationAttributes>
  implements MentorAttributes
{
  public id!: number;
  public userId!: number;
  public expertiseAreas!: string;
  public maxMentees!: number;
  public currentMentees!: number;
  public isAvailable!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Mentor.init(
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
    expertiseAreas: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'expertise_areas',
    },
    maxMentees: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 5,
      field: 'max_mentees',
    },
    currentMentees: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'current_mentees',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_available',
    },
  },
  {
    sequelize,
    tableName: 'mentors',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id'] },
      { fields: ['is_available'] },
    ],
  }
);
