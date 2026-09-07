import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CareerRecommendationAttributes {
  id: number;
  studentId: number;
  careerRoleId: number;
  matchScore: number;
  reasoning?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CareerRecommendationCreationAttributes
  extends Optional<CareerRecommendationAttributes, 'id' | 'reasoning' | 'createdAt' | 'updatedAt'> {}

export class CareerRecommendation
  extends Model<CareerRecommendationAttributes, CareerRecommendationCreationAttributes>
  implements CareerRecommendationAttributes
{
  public id!: number;
  public studentId!: number;
  public careerRoleId!: number;
  public matchScore!: number;
  public reasoning!: object | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CareerRecommendation.init(
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
    careerRoleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'career_role_id',
      references: {
        model: 'career_roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    matchScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'match_score',
    },
    reasoning: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'reasoning',
    },
  },
  {
    sequelize,
    tableName: 'career_recommendations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['career_role_id'] },
      { fields: ['match_score'] },
    ],
  }
);
