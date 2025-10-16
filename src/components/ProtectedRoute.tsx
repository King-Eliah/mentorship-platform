import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * 
 * Features:
 * - Verifies JWT token validity
 * - Redirects to login if unauthenticated
 * - Supports role-based access control
 * - Preserves intended destination after login
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/login'
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Preserve the current location to redirect back after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // User is authenticated but doesn't have required role
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes with specific roles
 */
export const withRoleProtection = (
  Component: React.ComponentType,
  requiredRoles: Role[]
) => {
  return (props: Record<string, unknown>) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

/**
 * Hook for checking if current user has specific role(s)
 */
export const useRoleCheck = () => {
  const { user } = useAuth();

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole(Role.ADMIN);
  };

  const isMentor = (): boolean => {
    return hasRole(Role.MENTOR);
  };

  const isMentee = (): boolean => {
    return hasRole(Role.MENTEE);
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isMentor,
    isMentee,
    currentRole: user?.role
  };
};

export default ProtectedRoute;