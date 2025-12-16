import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isSeller } from '@/lib/utils/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Route guard that only allows admin users to access admin routes
 * Redirects non-authenticated users to login page
 * Redirects seller users to seller dashboard
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const userIsSeller = isSeller(user);

  // Show loading while checking auth
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

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Redirect sellers to seller dashboard
  if (userIsSeller) {
    return <Navigate to="/seller" replace />;
  }

  // Allow admin access
  return <>{children}</>;
};

