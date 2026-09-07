import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AcademicInstitutionAssociationAttributes {
  id: number;
  academicianId: number;
  institutionId: number;
  designation: string;
  department: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  isCurrent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AcademicInstitutionAssociationCreationAttributes
  extends Optional<
    AcademicInstitutionAssociationAttributes,
    'id' | 'endDate' | 'isCurrent' | 'createdAt' | 'updatedAt'
  > {}

export class AcademicInstitutionAssociation
  extends Model<
    AcademicInstitutionAssociationAttributes,
    AcademicInstitutionAssociationCreationAttributes
  >
  implements AcademicInstitutionAssociationAttributes
{
  public id!: number;
  public academicianId!: number;
  public institutionId!: number;
  public designation!: string;
  public department!: string;
  public startDate!: string | Date;
  public endDate!: string | Date | null;
  public isCurrent!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AcademicInstitutionAssociation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    academicianId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'academician_id',
      references: {
        model: 'academician_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'designation',
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'department',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_current',
    },
  },
  {
    sequelize,
    tableName: 'academic_institution_associations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['academician_id'] },
      { fields: ['institution_id'] },
    ],
  }
);
