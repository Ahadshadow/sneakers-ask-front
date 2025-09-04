import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProtectedRoute } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallbackPath = '/signin',
}) => {
  const location = useLocation();
  const { accessStatus, isLoading, user } = useProtectedRoute(requiredRoles);

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (accessStatus === 'unauthenticated') {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Show unauthorized message if user doesn't have required role
  if (accessStatus === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-muted-foreground mt-2">
                  You don't have permission to access this page.
                </p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Required roles: {requiredRoles?.join(', ') || 'Any authenticated user'}
                  <br />
                  Your role: {user?.role || 'Unknown'}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Go Home
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) => {
  return (props: P) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route protectors
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return withAuth(Component, ['admin']);
};

export const withManagerAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return withAuth(Component, ['admin', 'manager']);
};

export const withEmployeeAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return withAuth(Component, ['admin', 'manager', 'employee']);
};
