import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authService } from '../services/authService';
import { authStorage } from '../utils/authStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on startup
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      if (authStorage.hasAuthTokens()) {
        // Initial optimistic load from local storage to prevent UI jump
        const cachedUser = authStorage.getStoredUser();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Verify with server
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        } catch (error) {
          // If server rejects token and clears session, reset user
          if (!authStorage.hasAuthTokens()) {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Listen for unauthorized/session-expired events dispatched by API client
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [restoreSession]);

  const login = async (credentials: LoginRequest): Promise<User> => {
    const { user: authenticatedUser } = await authService.login(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    const { user: registeredUser } = await authService.register(data);
    // After registration, attempt auto-login if backend returns tokens or caller initiates login
    return registeredUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshSession = async (): Promise<User | null> => {
    try {
      if (authStorage.hasAuthTokens()) {
        const freshUser = await authService.getCurrentUser();
        setUser(freshUser);
        return freshUser;
      }
      return null;
    } catch {
      setUser(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
