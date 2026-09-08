import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './apiConfig';
import { authStorage } from '../utils/authStorage';

// Create Central Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// State for handling concurrent token refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Automatically attach Bearer JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and Token Refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If no response or network error
    if (!error.response) {
      const networkError = new Error('Network error. Please check your internet connection or if server is running.');
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;
    const requestUrl = originalRequest?.url || '';

    // Bypass refresh logic for auth endpoints (login, register, refresh)
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const currentRefreshToken = authStorage.getRefreshToken();

      // If no refresh token exists, immediately clear auth and reject
      if (!currentRefreshToken) {
        authStorage.clearAuthSession();
        window.dispatchEvent(new Event('auth:unauthorized'));
        const authError = new Error(data?.message || 'Session expired. Please log in again.');
        return Promise.reject(authError);
      }

      if (isRefreshing) {
        // Queue the request until token refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend refresh endpoint using a clean axios call to avoid loops
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken,
        });

        const { accessToken, refreshToken } = refreshResponse.data?.data || {};

        if (!accessToken) {
          throw new Error('Invalid refresh response from server');
        }

        // Store new tokens
        authStorage.setAccessToken(accessToken);
        if (refreshToken) {
          authStorage.setRefreshToken(refreshToken);
        }

        // Update default header
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        authStorage.clearAuthSession();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // Format human-friendly error messages from backend response
    let errorMessage = data?.message;
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const detailed = data.errors.map((e: any) => e.message || e).filter(Boolean).join('. ');
      if (detailed) {
        errorMessage = detailed;
      }
    }
    if (!errorMessage) {
      switch (status) {
        case 400:
          errorMessage = 'Invalid request. Please check your submitted data.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission for this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = 'A conflict occurred. This record may already exist.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
    }

    const formattedError = new Error(errorMessage);
    (formattedError as any).status = status;
    (formattedError as any).response = error.response;

    return Promise.reject(formattedError);
  }
);

export default apiClient;
