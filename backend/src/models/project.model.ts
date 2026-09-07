import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus } from '../constants/enums';

export interface ProjectAttributes {
  id: number;
  industryId: number;
  title: string;
  description: string;
  deliverables?: string | null;
  durationWeeks?: number | null;
  budget?: number | null;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<
    ProjectAttributes,
    'id' | 'deliverables' | 'durationWeeks' | 'budget' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: number;
  public industryId!: number;
  public title!: string;
  public description!: string;
  public deliverables!: string | null;
  public durationWeeks!: number | null;
  public budget!: number | null;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    industryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'industry_id',
      references: {
        model: 'industry_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
    },
    deliverables: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'deliverables',
    },
    durationWeeks: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'duration_weeks',
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'budget',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OpportunityStatus)),
      allowNull: false,
      defaultValue: OpportunityStatus.OPEN,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['status'] },
    ],
  }
);
