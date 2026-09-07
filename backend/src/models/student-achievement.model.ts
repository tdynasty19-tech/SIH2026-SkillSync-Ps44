import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentAchievementAttributes {
  id: number;
  studentId: number;
  title: string;
  description?: string | null;
  date?: Date | null;
  awardUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentAchievementCreationAttributes
  extends Optional<
    StudentAchievementAttributes,
    'id' | 'description' | 'date' | 'awardUrl' | 'createdAt' | 'updatedAt'
  > {}

export class StudentAchievement
  extends Model<StudentAchievementAttributes, StudentAchievementCreationAttributes>
  implements StudentAchievementAttributes
{
  public id!: number;
  public studentId!: number;
  public title!: string;
  public description!: string | null;
  public date!: Date | null;
  public awardUrl!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentAchievement.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_awarded',
    },
    awardUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'proof_url',
    },
  },
  {
    sequelize,
    tableName: 'student_achievements',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['student_id'] }],
  }
);
