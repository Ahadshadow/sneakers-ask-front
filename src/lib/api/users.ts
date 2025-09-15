// Users API service layer
// This file handles all user-related API calls

export interface Role {
  id: number;
  name: string;
  description: string;
  color: string;
  user_count?: number;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  status: 'active' | 'inactive' | 'pending';
  join_date: string;
  full_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
  status?: 'active' | 'inactive' | 'pending';
  join_date?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  status?: 'active' | 'inactive' | 'pending';
  join_date?: string;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive' | 'pending';
}

export interface UsersListParams {
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  role_id?: number;
  per_page?: number;
  page?: number;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use the default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (data && typeof data === 'object') {
      return data;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Users API functions
export const usersApi = {
  // Get all users with optional filtering and pagination
  async getUsers(params: UsersListParams = {}): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.role_id) searchParams.append('role_id', params.role_id.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params.page) searchParams.append('page', params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return apiRequest<UsersListResponse>(endpoint);
  },

  // Get a specific user by ID
  async getUser(id: number): Promise<UserResponse> {
    return apiRequest<UserResponse>(`/users/${id}`);
  },

  // Create a new user
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    return apiRequest<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update a user (all fields optional)
  async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
    return apiRequest<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete a user
  async deleteUser(id: number): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Update user status
  async updateUserStatus(id: number, statusData: UpdateUserStatusRequest): Promise<UserResponse> {
    return apiRequest<UserResponse>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },
};
