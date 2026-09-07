import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OpportunityMatchAttributes {
  id: number;
  studentId: number;
  opportunityId: number;
  opportunityType: string;
  matchScore: number;
  breakdown?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OpportunityMatchCreationAttributes
  extends Optional<OpportunityMatchAttributes, 'id' | 'breakdown' | 'createdAt' | 'updatedAt'> {}

export class OpportunityMatch
  extends Model<OpportunityMatchAttributes, OpportunityMatchCreationAttributes>
  implements OpportunityMatchAttributes
{
  public id!: number;
  public studentId!: number;
  public opportunityId!: number;
  public opportunityType!: string;
  public matchScore!: number;
  public breakdown!: object | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OpportunityMatch.init(
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
    opportunityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'opportunity_id',
    },
    opportunityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'opportunity_type',
    },
    matchScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'match_score',
    },
    breakdown: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'breakdown',
    },
  },
  {
    sequelize,
    tableName: 'opportunity_matches',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['student_id', 'opportunity_id', 'opportunity_type'] },
      { fields: ['student_id'] },
      { fields: ['match_score'] },
    ],
  }
);
