import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentCertificationAttributes {
  id: number;
  studentId: number;
  title: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentCertificationCreationAttributes
  extends Optional<
    StudentCertificationAttributes,
    'id' | 'expirationDate' | 'credentialId' | 'credentialUrl' | 'createdAt' | 'updatedAt'
  > {}

export class StudentCertification
  extends Model<StudentCertificationAttributes, StudentCertificationCreationAttributes>
  implements StudentCertificationAttributes
{
  public id!: number;
  public studentId!: number;
  public title!: string;
  public issuingOrganization!: string;
  public issueDate!: Date;
  public expirationDate!: Date | null;
  public credentialId!: string | null;
  public credentialUrl!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentCertification.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title',
    },
    issuingOrganization: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'issuer',
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'issue_date',
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'expiration_date',
    },
    credentialId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'credential_id',
    },
    credentialUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'credential_url',
    },
  },
  {
    sequelize,
    tableName: 'student_certifications',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['student_id'] }],
  }
);
