import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions/roles. If false, ANY will do
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  requireAll = true
}) => {
  const { hasPermission, hasRole, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role access
  if (roles.length > 0) {
    const roleCheck = requireAll 
      ? roles.every(role => hasRole(role))
      : roles.some(role => hasRole(role));
    
    if (!roleCheck) {
      return <>{fallback}</>;
    }
  }

  // Check permission access
  if (permissions.length > 0) {
    const permissionCheck = requireAll
      ? permissions.every(permission => hasPermission(permission))
      : permissions.some(permission => hasPermission(permission));
    
    if (!permissionCheck) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate roles={['Super Admin']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const ManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate roles={['Super Admin', 'Platform Manager']} requireAll={false} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const SellerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate roles={['Verified Seller', 'Basic Seller']} requireAll={false} fallback={fallback}>
    {children}
  </PermissionGate>
);