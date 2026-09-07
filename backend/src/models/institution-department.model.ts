import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface InstitutionDepartmentAttributes {
  id: number;
  institutionId: number;
  departmentName: string;
  departmentCode?: string | null;
  hodName?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InstitutionDepartmentCreationAttributes
  extends Optional<
    InstitutionDepartmentAttributes,
    'id' | 'departmentCode' | 'hodName' | 'email' | 'phone' | 'createdAt' | 'updatedAt'
  > {}

export class InstitutionDepartment
  extends Model<InstitutionDepartmentAttributes, InstitutionDepartmentCreationAttributes>
  implements InstitutionDepartmentAttributes
{
  public id!: number;
  public institutionId!: number;
  public departmentName!: string;
  public departmentCode!: string | null;
  public hodName!: string | null;
  public email!: string | null;
  public phone!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InstitutionDepartment.init(
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
    departmentName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'department_name',
    },
    departmentCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'department_code',
    },
    hodName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'hod_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'email',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone',
    },
  },
  {
    sequelize,
    tableName: 'institution_departments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['institution_id'] },
      { unique: true, fields: ['institution_id', 'department_name'] },
    ],
  }
);
