import { apiClient } from './apiClient';
import {
  Role,
  BackendRole,
  User,
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  ApiResponse,
} from '../types/auth.types';
import { authStorage } from '../utils/authStorage';

/**
 * Normalizes backend PascalCase/uppercase role string into canonical frontend lowercase role
 */
export const normalizeRole = (roleStr?: string): Role => {
  if (!roleStr) return 'student';
  const lower = roleStr.trim().toLowerCase();
  switch (lower) {
    case 'student':
      return 'student';
    case 'industry':
      return 'industry';
    case 'academician':
      return 'academician';
    case 'institution':
      return 'institution';
    default:
      return 'student';
  }
};

/**
 * Maps frontend lowercase role to backend PascalCase role
 */
export const toBackendRole = (role: Role | string): BackendRole => {
  const lower = (role || '').trim().toLowerCase();
  switch (lower) {
    case 'student':
      return 'Student';
    case 'industry':
      return 'Industry';
    case 'academician':
      return 'Academician';
    case 'institution':
      return 'Institution';
    default:
      return 'Student';
  }
};

/**
 * Maps backend raw user entity to canonical frontend User interface
 */
export const mapUserResponse = (raw: any): User => {
  if (!raw) {
    throw new Error('No user data received from server');
  }
  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || raw.name || raw.email || 'User';

  return {
    id: raw.id,
    uuid: raw.uuid,
    firstName,
    lastName,
    name: fullName,
    email: raw.email,
    phone: raw.phone || null,
    role: normalizeRole(raw.role),
    rawRole: raw.role,
    avatar:
      raw.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=fff`,
    isVerified: !!raw.isVerified,
    isActive: raw.isActive !== false,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
    lastLoginAt: raw.lastLoginAt || null,
  };
};

export const authService = {
  /**
   * Log in user with credentials
   */
  async login(credentials: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }
    );

    const data = response.data?.data;
    if (!data || !data.user || !data.accessToken) {
      throw new Error(response.data?.message || 'Invalid login response from server');
    }

    const { user: rawUser, accessToken, refreshToken } = data;
    const user = mapUserResponse(rawUser);

    // Save session to storage
    authStorage.setAuthSession(accessToken, refreshToken, user);

    return { user, accessToken, refreshToken };
  },

  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<{ user: User }> {
    const response = await apiClient.post<ApiResponse<{ user: any }>>('/auth/register', {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: toBackendRole(data.role),
      phone: data.phone ? data.phone.trim() : undefined,
    });

    const responseData = response.data?.data;
    if (!responseData || !responseData.user) {
      throw new Error(response.data?.message || 'Invalid registration response from server');
    }

    const user = mapUserResponse(responseData.user);
    return { user };
  },

  /**
   * Fetch current authoritative user profile from server
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<any>>('/auth/me');
    const responseData = response.data?.data;
    if (!responseData) {
      throw new Error('Failed to retrieve user profile');
    }
    const user = mapUserResponse(responseData);
    authStorage.setStoredUser(user);
    return user;
  },

  /**
   * Refresh session tokens
   */
  async refreshToken(token: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken: token,
    });

    const data = response.data?.data;
    if (!data || !data.accessToken) {
      throw new Error('Failed to refresh tokens');
    }

    const { accessToken, refreshToken } = data;
    authStorage.setAccessToken(accessToken);
    if (refreshToken) {
      authStorage.setRefreshToken(refreshToken);
    }
    return { accessToken, refreshToken };
  },

  /**
   * Log out user and revoke active session
   */
  async logout(): Promise<void> {
    const currentRefreshToken = authStorage.getRefreshToken();
    try {
      if (currentRefreshToken) {
        await apiClient.post('/auth/logout', { refreshToken: currentRefreshToken });
      }
    } catch (e) {
      console.warn('Server logout notice:', e);
    } finally {
      authStorage.clearAuthSession();
    }
  },
};

export default authService;