import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user for demo - replace with actual Laravel API calls
  const mockUser: User = {
    id: '1',
    email: 'admin@sneakerask.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Platform Manager',
    permissions: [
      'users.view.all',
      'sellers.manage',
      'wtb.manage',
      'products.view.all',
      'orders.view.all',
      'analytics.platform'
    ],
    avatar: '/placeholder.svg',
    status: 'active'
  };

  useEffect(() => {
    // Check for existing session on app load
    // In real app, this would check localStorage token and validate with Laravel API
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // Mock authentication check - replace with actual API call
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Validate token with Laravel API
          // const response = await fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` }});
          // if (response.ok) {
          //   const userData = await response.json();
          //   setUser(userData.user);
          // }
          
          // For demo, set mock user
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Replace with actual Laravel API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // const data = await response.json();
      // if (response.ok) {
      //   localStorage.setItem('auth_token', data.token);
      //   setUser(data.user);
      //   return true;
      // }
      
      // Mock successful login for demo
      if (email && password) {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        setUser(mockUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    
    // Call Laravel API to invalidate token
    // fetch('/api/auth/logout', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    // });
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user?.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};