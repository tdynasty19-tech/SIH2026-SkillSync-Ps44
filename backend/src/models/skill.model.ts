import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SkillAttributes {
  id: number;
  name: string;
  slug: string;
  categoryId?: number | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillCreationAttributes
  extends Optional<SkillAttributes, 'id' | 'categoryId' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class Skill
  extends Model<SkillAttributes, SkillCreationAttributes>
  implements SkillAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public categoryId!: number | null;
  public description!: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Skill.init(
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
      field: 'name',
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      field: 'slug',
    },
    categoryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'skill_categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'skills',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['name'] },
      { fields: ['category_id'] },
      { fields: ['is_active'] },
    ],
  }
);
