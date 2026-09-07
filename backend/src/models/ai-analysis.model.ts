import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AIAnalysisAttributes {
  id: number;
  userId: number;
  analysisType: string;
  provider: string;
  inputData: object;
  outputData: object;
  confidenceScore?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIAnalysisCreationAttributes
  extends Optional<AIAnalysisAttributes, 'id' | 'confidenceScore' | 'createdAt' | 'updatedAt'> {}

export class AIAnalysis
  extends Model<AIAnalysisAttributes, AIAnalysisCreationAttributes>
  implements AIAnalysisAttributes
{
  public id!: number;
  public userId!: number;
  public analysisType!: string;
  public provider!: string;
  public inputData!: object;
  public outputData!: object;
  public confidenceScore!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIAnalysis.init(
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
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    analysisType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'analysis_type',
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'provider',
    },
    inputData: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'input_data',
    },
    outputData: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'output_data',
    },
    confidenceScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'confidence_score',
    },
  },
  {
    sequelize,
    tableName: 'ai_analyses',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['analysis_type'] },
      { fields: ['provider'] },
    ],
  }
);
