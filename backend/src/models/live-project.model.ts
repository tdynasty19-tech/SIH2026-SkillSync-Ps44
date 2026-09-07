import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LiveProjectAttributes {
  id: number;
  collaborationId: number;
  title: string;
  problemStatement: string;
  studentsCount: number;
  deadline?: string | Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LiveProjectCreationAttributes
  extends Optional<
    LiveProjectAttributes,
    'id' | 'studentsCount' | 'deadline' | 'createdAt' | 'updatedAt'
  > {}

export class LiveProject
  extends Model<LiveProjectAttributes, LiveProjectCreationAttributes>
  implements LiveProjectAttributes
{
  public id!: number;
  public collaborationId!: number;
  public title!: string;
  public problemStatement!: string;
  public studentsCount!: number;
  public deadline!: string | Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LiveProject.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title',
    },
    problemStatement: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'problem_statement',
    },
    studentsCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'students_count',
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'deadline',
    },
  },
  {
    sequelize,
    tableName: 'live_projects',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['collaboration_id'] }],
  }
);
