// Vendors API service layer
// This file handles all vendor-related API calls

export interface Vendor {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  order_items_count?: number;
}

export interface CreateVendorRequest {
  name: string; // Required
  email?: string; // Optional
  phone?: string; // Optional
}

export interface UpdateVendorRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface VendorsListParams {
  search?: string;
  per_page?: number | string; // Can be number or "all" or 0
  page?: number;
  sort_by?: 'name' | 'email' | 'phone' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface VendorsListResponse {
  success: boolean;
  data: {
    data: Vendor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

export interface VendorResponse {
  success: boolean;
  data: Vendor;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface DeleteVendorErrorResponse {
  success: false;
  message: string;
  order_items_count?: number;
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
  
  const config_request: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config_request.headers = {
      ...config_request.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...config_request,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // For delete errors, preserve the order_items_count if available
        if (response.status === 400 && errorData.order_items_count !== undefined) {
          const deleteError = errorData as DeleteVendorErrorResponse;
          throw deleteError;
        }
      } catch (error) {
        // If it's already a DeleteVendorErrorResponse, rethrow it
        if (error && typeof error === 'object' && 'order_items_count' in error) {
          throw error;
        }
        // Otherwise, throw a generic error
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
    // Re-throw DeleteVendorErrorResponse as-is
    if (error && typeof error === 'object' && 'order_items_count' in error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Vendors API functions
export const vendorsApi = {
  // Get all vendors with optional filtering and pagination
  async getVendors(params: VendorsListParams = {}): Promise<VendorsListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.per_page !== undefined) {
      if (params.per_page === 'all' || params.per_page === 0) {
        searchParams.append('per_page', 'all');
      } else {
        searchParams.append('per_page', params.per_page.toString());
      }
    }
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/vendors?${queryString}` : '/vendors';
    
    return apiRequest<VendorsListResponse>(endpoint);
  },

  // Get a specific vendor by ID
  async getVendor(id: number): Promise<VendorResponse> {
    return apiRequest<VendorResponse>(`/vendors/${id}`);
  },

  // Create a new vendor
  async createVendor(vendorData: CreateVendorRequest): Promise<VendorResponse> {
    return apiRequest<VendorResponse>('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  },

  // Update a vendor (all fields optional)
  async updateVendor(id: number, vendorData: UpdateVendorRequest): Promise<VendorResponse> {
    return apiRequest<VendorResponse>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    });
  },

  // Delete a vendor
  async deleteVendor(id: number): Promise<ApiResponse | DeleteVendorErrorResponse> {
    try {
      return await apiRequest<ApiResponse>(`/vendors/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // If it's a DeleteVendorErrorResponse, rethrow it
      if (error && typeof error === 'object' && 'order_items_count' in error) {
        throw error;
      }
      throw error;
    }
  },
};

