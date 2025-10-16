import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Role } from '../types';
import authService from '../services/authService';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  requestedRole?: Role;
  inviteCode?: string;
  bio?: string;
  skills?: string;
  experience?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPending: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<{ requiresApproval: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPending, setIsPending] = useState(false);

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user is stored in localStorage
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: RegisterRequest): Promise<{ requiresApproval: boolean }> => {
    try {
      setLoading(true);
      
      // Check if user provided invite code for mentor/admin roles
      const hasInviteCode = userData.inviteCode && userData.inviteCode.trim() !== '';
      
      // If no invite code, default to mentee role with pending status
      const registrationData = {
        ...userData,
        role: hasInviteCode ? (userData.requestedRole || Role.MENTEE) : Role.MENTEE
      };

      const response = await authService.signup(registrationData);
      
      // Check if user needs approval
      if (response.user.status === 'PENDING') {
        setIsPending(true);
        setIsAuthenticated(false);
        return { requiresApproval: true };
      } else {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsPending(false);
        return { requiresApproval: false };
      }
    } catch (error) {
      setIsAuthenticated(false);
      setIsPending(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might need to re-login
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Memoized context value
   */
  const contextValue = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    isPending,
    login,
    register,
    logout,
    refreshUser,
  }), [user, loading, isAuthenticated, isPending, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;