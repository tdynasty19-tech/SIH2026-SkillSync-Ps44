import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth.types';

interface RoleBasedRouteProps {
  allowedRoles: Role[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Verifying permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const roleRoutes: Record<string, string> = {
      student: '/student/dashboard',
      industry: '/industry/dashboard',
      academician: '/academician/dashboard',
      institution: '/institution/dashboard',
    };
    const target = roleRoutes[user.role?.toLowerCase()] || '/unauthorized';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
