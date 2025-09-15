// Roles API service layer
// This file handles all role-related API calls

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  user_count: number;
  color: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface RolesListParams {
  search?: string;
  per_page?: number;
  page?: number;
}

export interface RolesListResponse {
  success: boolean;
  data: Role[];
  message: string;
}

export interface RoleResponse {
  success: boolean;
  data: Role;
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

// Roles API functions
export const rolesApi = {
  // Get all roles with optional filtering and pagination
  async getRoles(params: RolesListParams = {}): Promise<RolesListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params.page) searchParams.append('page', params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/roles?${queryString}` : '/roles';
    
    return apiRequest<RolesListResponse>(endpoint);
  },

  // Get a specific role by ID
  async getRole(id: number): Promise<RoleResponse> {
    return apiRequest<RoleResponse>(`/roles/${id}`);
  },
};
