import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StudentProfileAttributes {
  id: number;
  userId: number;
  studentId?: string | null;
  headline?: string | null;
  bio?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  institutionId?: number | null;
  departmentId?: number | null;
  collegeName?: string | null;
  department?: string | null;
  course?: string | null;
  specialization?: string | null;
  currentSemester?: number | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  profileCompletion: number;
  careerGoal?: string | null;
  availabilityStatus?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentProfileCreationAttributes
  extends Optional<
    StudentProfileAttributes,
    | 'id'
    | 'studentId'
    | 'headline'
    | 'bio'
    | 'dateOfBirth'
    | 'gender'
    | 'location'
    | 'city'
    | 'state'
    | 'country'
    | 'institutionId'
    | 'departmentId'
    | 'collegeName'
    | 'department'
    | 'course'
    | 'specialization'
    | 'currentSemester'
    | 'graduationYear'
    | 'cgpa'
    | 'resumeUrl'
    | 'githubUrl'
    | 'linkedinUrl'
    | 'portfolioUrl'
    | 'profileCompletion'
    | 'careerGoal'
    | 'availabilityStatus'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class StudentProfile
  extends Model<StudentProfileAttributes, StudentProfileCreationAttributes>
  implements StudentProfileAttributes
{
  public id!: number;
  public userId!: number;
  public studentId!: string | null;
  public headline!: string | null;
  public bio!: string | null;
  public dateOfBirth!: Date | null;
  public gender!: string | null;
  public location!: string | null;
  public city!: string | null;
  public state!: string | null;
  public country!: string | null;
  public institutionId!: number | null;
  public departmentId!: number | null;
  public collegeName!: string | null;
  public department!: string | null;
  public course!: string | null;
  public specialization!: string | null;
  public currentSemester!: number | null;
  public graduationYear!: number | null;
  public cgpa!: number | null;
  public resumeUrl!: string | null;
  public githubUrl!: string | null;
  public linkedinUrl!: string | null;
  public portfolioUrl!: string | null;
  public profileCompletion!: number;
  public careerGoal!: string | null;
  public availabilityStatus!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentProfile.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    studentId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'student_id',
    },
    headline: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'headline',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bio',
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_of_birth',
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'gender',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'location',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city',
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'state',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'India',
      field: 'country',
    },
    institutionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'institution_id',
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    departmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'department_id',
      references: {
        model: 'institution_departments',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    collegeName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'college_name',
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'department',
    },
    course: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'course',
    },
    specialization: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'specialization',
    },
    currentSemester: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      field: 'current_semester',
    },
    graduationYear: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      field: 'graduation_year',
    },
    cgpa: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: 'cgpa',
    },
    resumeUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'resume_url',
    },
    githubUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'github_url',
    },
    linkedinUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'linkedin_url',
    },
    portfolioUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'portfolio_url',
    },
    profileCompletion: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'profile_completion',
    },
    careerGoal: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'career_goal',
    },
    availabilityStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'availability_status',
    },
  },
  {
    sequelize,
    tableName: 'student_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id'] },
      { fields: ['college_name'] },
      { fields: ['department'] },
      { fields: ['institution_id', 'department_id'] },
      { fields: ['graduation_year'] },
      { fields: ['location'] },
      { fields: ['city'] },
    ],
  }
);
