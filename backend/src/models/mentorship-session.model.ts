import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MentorshipSessionAttributes {
  id: number;
  mentorshipRequestId: number;
  sessionDate: Date | string;
  startTime: string;
  durationMinutes: number;
  meetingLink?: string | null;
  notes?: string | null;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MentorshipSessionCreationAttributes
  extends Optional<
    MentorshipSessionAttributes,
    'id' | 'durationMinutes' | 'meetingLink' | 'notes' | 'isCompleted' | 'createdAt' | 'updatedAt'
  > {}

export class MentorshipSession
  extends Model<MentorshipSessionAttributes, MentorshipSessionCreationAttributes>
  implements MentorshipSessionAttributes
{
  public id!: number;
  public mentorshipRequestId!: number;
  public sessionDate!: Date | string;
  public startTime!: string;
  public durationMinutes!: number;
  public meetingLink!: string | null;
  public notes!: string | null;
  public isCompleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MentorshipSession.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    mentorshipRequestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'mentorship_request_id',
      references: {
        model: 'mentorship_requests',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'session_date',
    },
    startTime: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'start_time',
    },
    durationMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 45,
      field: 'duration_minutes',
    },
    meetingLink: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'meeting_link',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes',
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_completed',
    },
  },
  {
    sequelize,
    tableName: 'mentorship_sessions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['mentorship_request_id'] },
    ],
  }
);
