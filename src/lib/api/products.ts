// Products API service layer
// This file handles all product-related API calls

import { config } from '@/lib/config';

// Product interfaces based on your API response
export interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: string;
  currency: string;
  order_count: number;
  status: string;
  order_status_urls: string[];
  shop_id: number;
  shopify_id: number;
  vendor: string;
  product_type: string;
  handle: string;
  variants_count: number;
  order_item_ids: number[];
  created_at: string;
  updated_at: string;
}

// Order Items interfaces based on your API response
export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  sku: string;
  variant: {
    variant: string;
  };
  price: number;
  currency: string;
  vendor: string;
  order_url: string;
  quantity: number;
}

export interface OrderItemsResponse {
  success: boolean;
  message: string;
  data: {
    order_items: OrderItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      has_more_pages: boolean;
      links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
      };
    };
  };
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      has_more_pages: boolean;
      next_page_url: string | null;
      prev_page_url: string | null;
      first_page_url: string;
      last_page_url: string;
      links: Array<{
        url: string;
        label: string;
        active: boolean;
      }>;
    };
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
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
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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

// Products API functions
export const productsApi = {
  // Get all products with pagination
  async getProducts(page: number = 1, perPage: number = 10): Promise<ProductsResponse> {
    return apiRequest<ProductsResponse>(`/products?page=${page}&per_page=${perPage}`);
  },

  // Get single product by ID
  async getProduct(id: number): Promise<{ success: boolean; data: { product: Product } }> {
    return apiRequest<{ success: boolean; data: { product: Product } }>(`/products/${id}`);
  },

  // Search products
  async searchProducts(query: string, page: number = 1): Promise<ProductsResponse> {
    return apiRequest<ProductsResponse>(`/products?search=${encodeURIComponent(query)}&page=${page}`);
  },

  // Filter products by status
  async getProductsByStatus(status: string, page: number = 1): Promise<ProductsResponse> {
    return apiRequest<ProductsResponse>(`/products?status=${status}&page=${page}`);
  },

  // Filter products by vendor
  async getProductsByVendor(vendor: string, page: number = 1): Promise<ProductsResponse> {
    return apiRequest<ProductsResponse>(`/products?vendor=${encodeURIComponent(vendor)}&page=${page}`);
  },

  // Get order items with pagination
  async getOrderItems(page: number = 1, perPage: number = 10): Promise<OrderItemsResponse> {
    return apiRequest<OrderItemsResponse>(`/order-items?page=${page}&per_page=${perPage}`);
  },

  // Search order items
  async searchOrderItems(query: string, page: number = 1): Promise<OrderItemsResponse> {
    return apiRequest<OrderItemsResponse>(`/order-items?search=${encodeURIComponent(query)}&page=${page}`);
  },

  // Filter order items by vendor
  async getOrderItemsByVendor(vendor: string, page: number = 1): Promise<OrderItemsResponse> {
    return apiRequest<OrderItemsResponse>(`/order-items?vendor=${encodeURIComponent(vendor)}&page=${page}`);
  },
};
