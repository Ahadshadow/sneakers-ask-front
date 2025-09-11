// Sellers API service layer
// This file handles all seller-related API calls

import { config } from '@/lib/config';

// Active Seller interface for WTB orders
export interface ActiveSeller {
  id: number;
  country: string;
  vat_registered: boolean;
  vat_number: string | null;
  tin_number: string | null;
  owner_name: string;
  email: string;
}

// Seller interfaces based on your API response
export interface Seller {
  id: number;
  store_name: string;
  owner_name: string;
  email: string;
  contact_person?: string;
  website?: string;
  tin_number?: string;
  country?: string;
  business_description?: string;
  seller_type: "private" | "b2b";
  status: "active" | "pending" | "suspended";
  products_count: number;
  total_sales: string;
  rating: string;
  join_date: string;
  vat_number?: string;
  vat_rate: string;
  vat_registered: boolean;
  account_holder: string;
  iban: string;
  bank_name: string;
  payment_schedule: "weekly" | "bi-weekly" | "monthly";
  created_at: string;
  updated_at: string;
  vat_settings: {
    vatNumber?: string;
    vatRate: string;
    vatRegistered: boolean;
  };
  bank_details: {
    accountHolder: string;
    iban: string;
    bankName: string;
    paymentSchedule: string;
  };
}

export interface SellersResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Seller[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreateSellerRequest {
  store_name: string;
  owner_name: string;
  email: string;
  seller_type: "private" | "b2b";
  status: "active" | "pending" | "suspended";
  products_count?: number;
  total_sales?: number;
  rating?: number;
  join_date: string;
  vat_number?: string;
  vat_rate: number;
  vat_registered: boolean;
  account_holder: string;
  iban: string;
  bank_name: string;
  payment_schedule: "weekly" | "bi-weekly" | "monthly";
}

export interface UpdateSellerRequest {
  store_name?: string;
  owner_name?: string;
  email?: string;
  seller_type?: "private" | "b2b";
  status?: "active" | "pending" | "suspended";
  products_count?: number;
  total_sales?: number;
  rating?: number;
  join_date?: string;
  vat_number?: string;
  vat_rate?: number;
  vat_registered?: boolean;
  account_holder?: string;
  iban?: string;
  bank_name?: string;
  payment_schedule?: "weekly" | "bi-weekly" | "monthly";
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Seller Payout interfaces based on actual API response
export interface SellerPayout {
  id: number;
  seller_store: string;
  seller_email: string;
  owner_name: string;
  item_name: string;
  seller_payout_amount: string;
  status: "pending" | "processing" | "completed";
  payment_date: string;
  created_at: string;
}

export interface SellerPayoutsResponse {
  success: boolean;
  message: string;
  data: {
    payouts: SellerPayout[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
      };
    };
  };
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.api.baseUrl}${endpoint}`;
  
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
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    const response = await fetch(url, {
      ...config_request,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.log('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        hasErrors: !!errorData.errors
      });
      
      // If it's a validation error with detailed errors, throw the full error object
      if (errorData.errors) {
        console.log('Throwing validation error:', errorData);
        // Create a proper error object that will be caught correctly
        const validationError = new Error(errorData.message || 'Validation failed');
        (validationError as any).errors = errorData.errors;
        (validationError as any).success = errorData.success;
        throw validationError;
      }
      
      console.log('Throwing generic error:', errorData.message);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.log('API Request catch block - error:', error);
    console.log('Error type:', typeof error);
    console.log('Error instanceof Error:', error instanceof Error);
    console.log('Error structure:', {
      hasResponse: !!error?.response,
      hasErrors: !!error?.errors,
      hasMessage: !!error?.message,
      error: error
    });
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    
    // Handle API response errors
    if (error?.response) {
      const response = await error.response.json();
      if (response.errors) {
        throw { ...response, errors: response.errors };
      }
      throw new Error(response.message || 'API request failed');
    }
    
    // If error is already an object with errors (from the if (!response.ok) block)
    if (error?.errors) {
      console.log('Error already has errors field, throwing as is:', error);
      throw error;
    }
    
    console.log('Throwing unexpected error');
    throw new Error('An unexpected error occurred');
  }
}

// Sellers API functions
export const sellersApi = {
  // Get all sellers with pagination
  async getSellers(page: number = 1, perPage: number = 15): Promise<SellersResponse> {
    return apiRequest<SellersResponse>(`/sellers?page=${page}&per_page=${perPage}`);
  },

  // Get single seller by ID
  async getSeller(id: number): Promise<{ success: boolean; data: Seller; message: string }> {
    return apiRequest<{ success: boolean; data: Seller; message: string }>(`/sellers/${id}`);
  },

  // Create new seller
  async createSeller(sellerData: CreateSellerRequest): Promise<{ success: boolean; data: Seller; message: string }> {
    return apiRequest<{ success: boolean; data: Seller; message: string }>('/sellers', {
      method: 'POST',
      body: JSON.stringify(sellerData),
    });
  },

  // Update seller
  async updateSeller(id: number, sellerData: UpdateSellerRequest): Promise<{ success: boolean; data: Seller; message: string }> {
    return apiRequest<{ success: boolean; data: Seller; message: string }>(`/sellers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sellerData),
    });
  },

  // Delete seller
  async deleteSeller(id: number): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/sellers/${id}`, {
      method: 'DELETE',
    });
  },

  // Update seller status
  async updateSellerStatus(id: number, status: "active" | "pending" | "suspended"): Promise<{ success: boolean; data: Seller; message: string }> {
    return apiRequest<{ success: boolean; data: Seller; message: string }>(`/sellers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Get active sellers only
  async getActiveSellers(): Promise<{ success: boolean; data: ActiveSeller[]; message: string; count: number }> {
    return apiRequest<{ success: boolean; data: ActiveSeller[]; message: string; count: number }>('/sellers/active');
  },

  // Get seller payouts with pagination
  async getSellerPayouts(page: number = 1, perPage: number = 15): Promise<SellerPayoutsResponse> {
    return apiRequest<SellerPayoutsResponse>(`/seller-payouts?page=${page}&per_page=${perPage}`);
  },

  // Get single seller payout by ID
  async getSellerPayout(id: string): Promise<{ success: boolean; data: SellerPayout; message: string }> {
    return apiRequest<{ success: boolean; data: SellerPayout; message: string }>(`/seller-payouts/${id}`);
  },

  // Update seller payout status
  async updatePayoutStatus(id: string, status: "pending" | "processing" | "completed"): Promise<{ success: boolean; data: SellerPayout; message: string }> {
    return apiRequest<{ success: boolean; data: SellerPayout; message: string }>(`/seller-payouts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Mark payout as completed
  async markPayoutCompleted(id: string): Promise<{ success: boolean; data: SellerPayout; message: string }> {
    return apiRequest<{ success: boolean; data: SellerPayout; message: string }>(`/seller-payouts/${id}/complete`, {
      method: 'PATCH',
    });
  },
};
