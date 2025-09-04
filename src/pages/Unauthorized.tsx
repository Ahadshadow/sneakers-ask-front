import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page or resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="text-center text-sm text-muted-foreground">
              Signed in as: <span className="font-medium">{user.email}</span>
              <br />
              Role: <span className="font-medium">{user.role}</span>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                Return to Dashboard
              </Link>
            </Button>
            
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Sign Out
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            If you believe this is an error, please contact your administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;