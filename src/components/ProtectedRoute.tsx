import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { securityService } from '../services/securityService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = []
}) => {
  const location = useLocation();
  const isAuthenticated = securityService.isAuthenticated();
  const currentUser = securityService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermissions.length > 0 && currentUser) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      currentUser.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 