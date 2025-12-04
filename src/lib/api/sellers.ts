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
  shipment_method_code?: string | null;
  store_name?: string | null;
  contact_person?: string | null;
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
  shipment_method_code?: string;
  whatsapp_number?: string;
  discord_name?: string;
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
  metrics?: {
    total_sellers: number;
    total_active: number;
    total_pending: number;
    total_suspended: number;
    total_b2b: number;
    total_private: number;
    filtered_count: number;
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
  shipment_method_code?: string;
  whatsapp_number?: string;
  discord_name?: string;
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
  shipment_method_code?: string;
  whatsapp_number?: string;
  discord_name?: string;
}

export interface CompleteRegistrationRequest {
  token: string;
  store_name: string;
  owner_name: string;
  contact_person?: string;
  website?: string;
  tin_number?: string;
  country?: string;
  business_description?: string;
  seller_type: "private" | "b2b";
  vat_number?: string;
  vat_rate?: number;
  vat_registered?: boolean;
  whatsapp_number?: string;
  account_holder?: string;
  iban?: string;
  bank_name?: string;
  shipment_method_code?: string;
  discord_name?: string;
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
  payment_date: string | null;
  created_at: string;
  whatsapp_number?: string; // Add WhatsApp number field
  account_holder?: string;
  iban?: string;
  bank_name?: string;
  payment_schedule?: string;
  payout_id?: string; // Payout ID
  shopify_order_number?: string; // Shopify Order Number
  created_by_employee?: {
    id: number;
    name: string;
    email: string;
  };
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

// Seller Invitations interfaces
export interface SellerInvitation {
  id: number;
  email: string;
  status: "pending" | "completed" | "expired";
  expires_at: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  is_expired: boolean;
  is_valid: boolean;
  days_until_expiry: number | null;
  seller: {
    id: number;
    email: string;
    store_name: string;
    owner_name: string;
  } | null;
}

export interface SellerInvitationsResponse {
  success: boolean;
  message: string;
  data: {
    invitations: SellerInvitation[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
  metrics?: {
    total_invitations: number;
    total_pending: number;
    total_completed: number;
    total_expired: number;
    total_valid: number;
    filtered_count: number;
  };
}

export interface ResendInvitationResponse {
  success: boolean;
  message: string;
  data: {
    invitation_id: number;
    email: string;
    status: string;
    expires_at: string;
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
  async getSellers(page: number = 1, perPage: number = 15, search?: string): Promise<SellersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("per_page", perPage.toString());
    if (search && search.trim().length > 0) {
      queryParams.append("search", search.trim());
    }
    return apiRequest<SellersResponse>(`/sellers?${queryParams.toString()}`);
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

  // Get active sellers only (no pagination - returns all active sellers)
  async getActiveSellers(): Promise<{ success: boolean; data: ActiveSeller[]; message: string; count: number }> {
    // Note: This endpoint returns all active sellers without pagination
    return apiRequest<{ success: boolean; data: ActiveSeller[]; message: string; count: number }>('/sellers/active');
  },

  // List seller invitations
  async getSellerInvitations(params?: {
    status?: "pending" | "completed" | "expired";
    search?: string;
    expired_only?: boolean;
    valid_only?: boolean;
    sort_by?: "created_at" | "updated_at" | "expires_at" | "email" | "status";
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<SellerInvitationsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.expired_only !== undefined) queryParams.append("expired_only", params.expired_only.toString());
    if (params?.valid_only !== undefined) queryParams.append("valid_only", params.valid_only.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const queryString = queryParams.toString();
    return apiRequest<SellerInvitationsResponse>(`/seller/invitations${queryString ? `?${queryString}` : ""}`);
  },

  // Resend invitation email
  async resendInvitation(id: number, frontendUrl?: string): Promise<ResendInvitationResponse> {
    const frontend_url = frontendUrl || window.location.origin;
    return apiRequest<ResendInvitationResponse>(`/seller/invitations/${id}/resend`, {
      method: "POST",
      body: JSON.stringify({ frontend_url }),
    });
  },

  // Get seller payouts with pagination
  async getSellerPayouts(page: number = 1, perPage: number = 15, search?: string): Promise<SellerPayoutsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("per_page", perPage.toString());
    if (search && search.trim().length > 0) {
      queryParams.append("search", search.trim());
    }
    return apiRequest<SellerPayoutsResponse>(`/seller-payouts?${queryParams.toString()}`);
  },

  // Get single seller payout by ID
  async getSellerPayout(id: string): Promise<{ success: boolean; data: SellerPayout; message: string }> {
    return apiRequest<{ success: boolean; data: SellerPayout; message: string }>(`/seller-payouts/${id}`);
  },

  // Update seller payout status
  async updatePayoutStatus(id: string, status: "pending" | "processing" | "completed"): Promise<{ success: boolean; data: SellerPayout; message: string }> {
    return apiRequest<{ success: boolean; data: SellerPayout; message: string }>(`/seller-payouts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Mark payout as completed
  async markPayoutCompleted(id: string): Promise<{ success: boolean; data: SellerPayout; message: string }> {
    return apiRequest<{ success: boolean; data: SellerPayout; message: string }>(`/seller-payouts/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // Send seller invitation by email
  async inviteSeller(email: string, frontendUrl: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/seller/invite', {
      method: 'POST',
      body: JSON.stringify({ email, frontend_url: frontendUrl }),
    });
  },

  // Verify seller invitation token
  async verifyToken(token: string): Promise<{ success: boolean; data: { email: string }; message: string }> {
    return apiRequest<{ success: boolean; data: { email: string }; message: string }>('/seller/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Complete seller registration (public endpoint)
  async completeRegistration(registrationData: CompleteRegistrationRequest): Promise<{ success: boolean; data: Seller; message: string }> {
    return apiRequest<{ success: boolean; data: Seller; message: string }>('/seller/complete-registration', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },
};
