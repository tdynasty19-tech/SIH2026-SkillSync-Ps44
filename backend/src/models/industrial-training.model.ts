import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IndustrialTrainingAttributes {
  id: number;
  collaborationId: number;
  domain: string;
  durationWeeks: number;
  batchSize: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndustrialTrainingCreationAttributes
  extends Optional<
    IndustrialTrainingAttributes,
    'id' | 'durationWeeks' | 'batchSize' | 'createdAt' | 'updatedAt'
  > {}

export class IndustrialTraining
  extends Model<IndustrialTrainingAttributes, IndustrialTrainingCreationAttributes>
  implements IndustrialTrainingAttributes
{
  public id!: number;
  public collaborationId!: number;
  public domain!: string;
  public durationWeeks!: number;
  public batchSize!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

IndustrialTraining.init(
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
    domain: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'domain',
    },
    durationWeeks: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 2,
      field: 'duration_weeks',
    },
    batchSize: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 20,
      field: 'batch_size',
    },
  },
  {
    sequelize,
    tableName: 'industrial_trainings',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['collaboration_id'] }],
  }
);
