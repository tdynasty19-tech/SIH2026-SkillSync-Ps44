import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MentorshipStatus } from '../constants/enums';

export interface MentorshipRequestAttributes {
  id: number;
  mentorId: number;
  studentId: number;
  goals: string;
  message?: string | null;
  status: MentorshipStatus;
  requestedAt: Date;
  respondedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MentorshipRequestCreationAttributes
  extends Optional<
    MentorshipRequestAttributes,
    'id' | 'message' | 'status' | 'requestedAt' | 'respondedAt' | 'createdAt' | 'updatedAt'
  > {}

export class MentorshipRequest
  extends Model<MentorshipRequestAttributes, MentorshipRequestCreationAttributes>
  implements MentorshipRequestAttributes
{
  public id!: number;
  public mentorId!: number;
  public studentId!: number;
  public goals!: string;
  public message!: string | null;
  public status!: MentorshipStatus;
  public requestedAt!: Date;
  public respondedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MentorshipRequest.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    mentorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'mentor_id',
      references: {
        model: 'mentors',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'student_id',
      references: {
        model: 'student_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    goals: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'goals',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'message',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MentorshipStatus)),
      allowNull: false,
      defaultValue: MentorshipStatus.REQUESTED,
      field: 'status',
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'requested_at',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'responded_at',
    },
  },
  {
    sequelize,
    tableName: 'mentorship_requests',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['mentor_id'] },
      { fields: ['student_id'] },
      { fields: ['status'] },
    ],
  }
);
