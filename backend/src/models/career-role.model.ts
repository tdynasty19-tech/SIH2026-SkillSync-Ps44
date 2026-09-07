import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CareerRoleAttributes {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CareerRoleCreationAttributes
  extends Optional<CareerRoleAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

export class CareerRole
  extends Model<CareerRoleAttributes, CareerRoleCreationAttributes>
  implements CareerRoleAttributes
{
  public id!: number;
  public title!: string;
  public slug!: string;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CareerRole.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'title',
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      field: 'slug',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
  },
  {
    sequelize,
    tableName: 'career_roles',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['slug'] },
    ],
  }
);
