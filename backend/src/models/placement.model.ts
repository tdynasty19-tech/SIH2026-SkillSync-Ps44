import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PlacementAttributes {
  id: number;
  institutionId: number;
  academicYear: string;
  totalStudents: number;
  placedStudents: number;
  higherStudiesStudents: number;
  entrepreneurshipStudents: number;
  averageSalary?: number | null;
  highestSalary?: number | null;
  medianSalary?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlacementCreationAttributes
  extends Optional<
    PlacementAttributes,
    | 'id'
    | 'totalStudents'
    | 'placedStudents'
    | 'higherStudiesStudents'
    | 'entrepreneurshipStudents'
    | 'averageSalary'
    | 'highestSalary'
    | 'medianSalary'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Placement
  extends Model<PlacementAttributes, PlacementCreationAttributes>
  implements PlacementAttributes
{
  public id!: number;
  public institutionId!: number;
  public academicYear!: string;
  public totalStudents!: number;
  public placedStudents!: number;
  public higherStudiesStudents!: number;
  public entrepreneurshipStudents!: number;
  public averageSalary!: number | null;
  public highestSalary!: number | null;
  public medianSalary!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Placement.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academic_year',
    },
    totalStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'total_students',
    },
    placedStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'placed_students',
    },
    higherStudiesStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'higher_studies_students',
    },
    entrepreneurshipStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'entrepreneurship_students',
    },
    averageSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'average_salary',
    },
    highestSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'highest_salary',
    },
    medianSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'median_salary',
    },
  },
  {
    sequelize,
    tableName: 'placements',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { unique: true, fields: ['institution_id', 'academic_year'] },
    ],
  }
);
