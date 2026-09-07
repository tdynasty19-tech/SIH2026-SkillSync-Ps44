import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentLanguageAttributes {
  id: number;
  studentId: number;
  language: string;
  proficiency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentLanguageCreationAttributes
  extends Optional<StudentLanguageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class StudentLanguage
  extends Model<StudentLanguageAttributes, StudentLanguageCreationAttributes>
  implements StudentLanguageAttributes
{
  public id!: number;
  public studentId!: number;
  public language!: string;
  public proficiency!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentLanguage.init(
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
    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'language_name',
    },
    proficiency: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'proficiency',
    },
  },
  {
    sequelize,
    tableName: 'student_languages',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['student_id'] }],
  }
);
