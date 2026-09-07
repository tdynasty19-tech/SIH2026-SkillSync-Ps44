import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OpportunityStatus } from '../constants/enums';

export interface LearningProgramAttributes {
  id: number;
  industryId?: number | null;
  institutionId?: number | null;
  title: string;
  description: string;
  curriculum?: string | null;
  durationHours?: number | null;
  mode: string;
  cost: number;
  status: OpportunityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LearningProgramCreationAttributes
  extends Optional<
    LearningProgramAttributes,
    'id' | 'industryId' | 'institutionId' | 'curriculum' | 'durationHours' | 'mode' | 'cost' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class LearningProgram
  extends Model<LearningProgramAttributes, LearningProgramCreationAttributes>
  implements LearningProgramAttributes
{
  public id!: number;
  public industryId!: number | null;
  public institutionId!: number | null;
  public title!: string;
  public description!: string;
  public curriculum!: string | null;
  public durationHours!: number | null;
  public mode!: string;
  public cost!: number;
  public status!: OpportunityStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LearningProgram.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    industryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'industry_id',
      references: {
        model: 'industry_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    curriculum: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'curriculum',
    },
    durationHours: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'duration_hours',
    },
    mode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ONLINE',
      field: 'mode',
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: 'cost',
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
    tableName: 'learning_programs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['industry_id'] },
      { fields: ['institution_id'] },
      { fields: ['status'] },
    ],
  }
);
