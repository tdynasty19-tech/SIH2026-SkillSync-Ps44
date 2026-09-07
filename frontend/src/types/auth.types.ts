export type Role = 'student' | 'industry' | 'academician' | 'institution';

export type BackendRole = 'Student' | 'Industry' | 'Academician' | 'Institution';

export const UserRoles = {
  STUDENT: 'student' as Role,
  INDUSTRY: 'industry' as Role,
  ACADEMICIAN: 'academician' as Role,
  INSTITUTION: 'institution' as Role,
} as const;

export const BackendUserRoles = {
  STUDENT: 'Student' as BackendRole,
  INDUSTRY: 'Industry' as BackendRole,
  ACADEMICIAN: 'Academician' as BackendRole,
  INSTITUTION: 'Institution' as BackendRole,
} as const;

export interface User {
  id: number | string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  rawRole?: BackendRole | string;
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role | BackendRole;
  phone?: string | null;
}

export interface AuthResponseData {
  user: {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    role: BackendRole | string;
    isVerified?: boolean;
    isActive?: boolean;
    lastLoginAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}
