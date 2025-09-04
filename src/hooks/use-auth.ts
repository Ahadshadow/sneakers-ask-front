// Custom auth hooks
// This file provides additional auth-related hooks beyond the main useAuth hook

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useToast } from './use-toast';

// Hook for checking if user has specific role
export const useRole = (role: string) => {
  const { user, hasRole } = useAuth();
  return hasRole(role);
};

// Hook for checking if user has any of the specified roles
export const useAnyRole = (roles: string[]) => {
  const { user, hasAnyRole } = useAuth();
  return hasAnyRole(roles);
};

// Hook for admin role check
export const useIsAdmin = () => {
  return useRole('admin');
};

// Hook for manager role check
export const useIsManager = () => {
  return useRole('manager');
};

// Hook for employee role check
export const useIsEmployee = () => {
  return useRole('employee');
};

// Hook for checking if user can access admin features
export const useCanAccessAdmin = () => {
  return useAnyRole(['admin', 'manager']);
};

// Hook for user profile management
export const useUserProfile = () => {
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'user'], response.data.user);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (response) => {
      toast({
        title: "Password changed",
        description: response.message || "Your password has been changed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Password change failed",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    refreshAuth,
  };
};

// Hook for password reset functionality
export const usePasswordReset = () => {
  const { toast } = useToast();

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (response) => {
      toast({
        title: "Reset email sent",
        description: response.message || "Check your email for password reset instructions",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (response) => {
      toast({
        title: "Password reset",
        description: response.message || "Your password has been reset successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  return {
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    isSendingReset: forgotPasswordMutation.isPending,
    isResetting: resetPasswordMutation.isPending,
  };
};

// Hook for auth status and loading states
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isLoggedIn: isAuthenticated && !!user,
    isLoggedOut: !isAuthenticated && !isLoading,
    user,
  };
};

// Hook for protected route access
export const useProtectedRoute = (requiredRoles?: string[]) => {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();

  const canAccess = () => {
    if (isLoading) return 'loading';
    if (!isAuthenticated) return 'unauthenticated';
    if (requiredRoles && !hasAnyRole(requiredRoles)) return 'unauthorized';
    return 'authorized';
  };

  return {
    accessStatus: canAccess(),
    canAccess: canAccess() === 'authorized',
    isLoading,
    user,
  };
};
