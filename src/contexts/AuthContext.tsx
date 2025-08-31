import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'finance' | 'customer_care';
  permissions: string[];
  avatar?: string;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Role-based permissions mapping
  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return [
          'users.view.all', 'users.create', 'users.edit.all', 'users.delete',
          'sellers.view.all', 'sellers.create', 'sellers.edit', 'sellers.delete',
          'wtb.create', 'wtb.manage', 'wtb.view.all',
          'products.view.all', 'products.create', 'products.edit', 'products.delete',
          'orders.view.all', 'orders.create', 'orders.edit', 'orders.delete',
          'payouts.view.all', 'payouts.manage',
          'analytics.platform', 'roles.manage'
        ];
      case 'finance':
        return [
          'sellers.view.all', 'sellers.edit',
          'wtb.view.all', 'wtb.manage',
          'orders.view.all', 'orders.edit',
          'payouts.view.all', 'payouts.manage',
          'analytics.finance'
        ];
      case 'customer_care':
        return [
          'users.view.all', 'users.edit.own',
          'sellers.view.all',
          'wtb.create', 'wtb.view.all',
          'products.view.all',
          'orders.view.all', 'orders.create',
          'analytics.basic'
        ];
      default:
        return [];
    }
  };

  // Fetch user profile data from Supabase
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (profile) {
        const userData: User = {
          id: profile.user_id,
          email: profile.email,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role,
          permissions: getRolePermissions(profile.role),
          isActive: profile.is_active
        };
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
    }
    return null;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setIsLoading(true);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error.message);
        return false;
      }

      if (data.user) {
        const userData = await fetchUserProfile(data.user);
        return !!userData;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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