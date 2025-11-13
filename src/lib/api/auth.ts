// Auth API service layer
// This file handles all authentication-related API calls

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
    expires_at?: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    expires_at?: string;
  };
}

export interface OtpLoginResponse {
  success: boolean;
  message: string;
  data: { email: string };
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    user: User;
    expires_at?: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

import { config } from '@/lib/config';

// Base API configuration
const API_BASE_URL = config.api.baseUrl;
const API_TIMEOUT = config.api.timeout;

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`) as any;
      error.status = response.status;
      error.data = errorData;
      error.errors = errorData.errors;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Auth API functions
export const authApi = {
 // Step 1: Login with email/password (returns OTP sent)
  async loginWithOtp(credentials: LoginCredentials): Promise<OtpLoginResponse> {
    return apiRequest<OtpLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Step 2: Verify OTP
  async verifyOtp(email: string, otp: string): Promise<OtpVerifyResponse> {
    return apiRequest<OtpVerifyResponse>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  // Logout user
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/logout', {
      method: 'POST',
    });
  },

  // Refresh token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return apiRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  // No need for getCurrentUser since we store user data in localStorage

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> {
    return apiRequest<{ success: boolean; data: { user: User } }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Forgot password
  async forgotPassword(email: string, frontendUrl?: string): Promise<{ success: boolean; message: string }> {
    const frontend_url = frontendUrl || window.location.origin;
    return apiRequest<{ success: boolean; message: string }>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, frontend_url }),
    });
  },

  // Reset password
  async resetPassword(data: {
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Token management utilities
export const tokenManager = {
  // Save tokens and user data to localStorage
  saveTokens(token: string, refreshToken: string, user?: User, expiresAt?: string): void {
    localStorage.setItem(config.auth.tokenKey, token);
    localStorage.setItem(config.auth.refreshTokenKey, refreshToken);
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    if (expiresAt) {
      localStorage.setItem('token_expires_at', expiresAt);
    }
  },

  // Update token only (for refresh)
  updateToken(token: string, expiresAt?: string): void {
    localStorage.setItem(config.auth.tokenKey, token);
    if (expiresAt) {
      localStorage.setItem('token_expires_at', expiresAt);
    }
  },

  // Get access token
  getToken(): string | null {
    return localStorage.getItem(config.auth.tokenKey);
  },

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(config.auth.refreshTokenKey);
  },

  // Get user data from localStorage
  getUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Clear all tokens and user data
  clearTokens(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem('user_data');
    localStorage.removeItem('token_expires_at');
  },

  // Get token expiry time
  getTokenExpiry(): Date | null {
    const expiresAt = localStorage.getItem('token_expires_at');
    return expiresAt ? new Date(expiresAt) : null;
  },

  // Check if token is expired
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;
    
    const expiresAt = this.getTokenExpiry();
    if (expiresAt) {
      // Add 5 minute buffer before actual expiry
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return Date.now() >= (expiresAt.getTime() - bufferTime);
    }
    
    // Fallback: Basic JWT token expiry check
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      // If token is not JWT format, assume it's valid for now
      return false;
    }
  },

  // Check if token needs refresh (within 10 minutes of expiry)
  needsRefresh(): boolean {
    const expiresAt = this.getTokenExpiry();
    if (!expiresAt) return false;
    
    const refreshBuffer = 10 * 60 * 1000; // 10 minutes in milliseconds
    return Date.now() >= (expiresAt.getTime() - refreshBuffer);
  },
};
