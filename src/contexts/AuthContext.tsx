import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, tokenManager, type User, type LoginCredentials } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Auth context types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is authenticated based on token presence
  const isAuthenticated = !!tokenManager.getToken();

  // Get user from localStorage first
  const [localUser, setLocalUser] = useState<User | null>(null);

  // No need for getCurrentUser query since we store user data in localStorage
  const isUserLoading = false;
  const userError = null;
  const refetchUser = () => {};

  // Extract user from localStorage only
  const user = localUser;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Save tokens and user data
      tokenManager.saveTokens(data.data.token, data.data.token, data.data.user, data.data.expires_at);
      
      // Update local state
      setLocalUser(data.data.user);
      
      // No need to update query cache since we're not using getCurrentUser
      
      // No need for token refresh timer since we want simple login/logout
      
      // Show success message
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.data.user.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // No need for refresh token mutation since we want simple login/logout

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      handleLogout();
      
      // Show success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      // Even if logout API fails, clear local data
      handleLogout();
    },
  });

  // Handle logout (clear data and timers)
  const handleLogout = () => {
    // Clear tokens, user data and cache
    tokenManager.clearTokens();
    setLocalUser(null);
    queryClient.clear();
    
    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // No need for token refresh timer since we want simple login/logout

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getToken();
      const userData = tokenManager.getUser();
      
      // Set user data from localStorage if available
      if (userData) {
        setLocalUser(userData);
      }
      
      if (token) {
        // Check if token is expired
        if (tokenManager.isTokenExpired(token)) {
          // Token expired, clear tokens
          handleLogout();
        }
        // No need for refresh timer since we want simple login/logout
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // No need for auth error handling since we're not using getCurrentUser

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear refresh timer on unmount
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    await loginMutation.mutateAsync(credentials);
  };

  // Logout function
  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  // Refresh auth function
  const refreshAuth = async (): Promise<void> => {
    try {
      const refreshData = await authApi.refreshToken();
      tokenManager.saveTokens(refreshData.data.token, refreshData.data.token);
      await refetchUser();
    } catch (error) {
      // Refresh failed, logout user
      tokenManager.clearTokens();
      queryClient.clear();
      throw error;
    }
  };

  // Role checking functions (simplified since backend doesn't have roles yet)
  const hasRole = (role: string): boolean => {
    // For now, all authenticated users have access
    // You can implement role-based logic when backend adds roles
    return !!user;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    // For now, all authenticated users have access
    // You can implement role-based logic when backend adds roles
    return !!user;
  };

  // Context value
  const contextValue: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading: isUserLoading || !isInitialized,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    login,
    logout,
    refreshAuth,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context for advanced usage
export { AuthContext };
