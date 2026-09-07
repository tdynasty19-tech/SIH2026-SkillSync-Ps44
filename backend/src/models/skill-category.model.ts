import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SkillCategoryAttributes {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillCategoryCreationAttributes
  extends Optional<SkillCategoryAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

export class SkillCategory
  extends Model<SkillCategoryAttributes, SkillCategoryCreationAttributes>
  implements SkillCategoryAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SkillCategory.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
  },
  {
    sequelize,
    tableName: 'skill_categories',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['name'] }],
  }
);
