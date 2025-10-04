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
  order_number: string;
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
  status: string;
  manual_status: string;
  destination: string;
  customer: string;
  processed_at: string;
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

// WTB Items response interface
export interface WTBItemsResponse {
  success: boolean;
  message: string;
  data: {
    wtb_items: WTBItem[];
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

// WTB Item interface based on actual API response
export interface WTBItem {
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
  status: string;
  wtb_order_id: string;
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

  // Get single order item details by ID
  async getOrderItemDetails(id: number): Promise<{
    success: boolean;
    message: string;
    data: {
      order_item: OrderItem & {
        order_number: string;
        order_url: string;
        order_created_at: string;
        order_updated_at: string;
        display_name: string;
        product_type: string;
        barcode: string;
        shopify_line_item_id: number;
        shopify_product_id: number;
        shopify_variant_id: number;
        total_price: number;
        total_discount: number;
        net_price: number;
        weight: number;
        weight_unit: string | null;
        grams: number;
        taxable: boolean;
        requires_shipping: boolean;
        gift_card: boolean;
        fulfillment_status: string | null;
        fulfillment_service: string;
        customer_email: string;
        customer_name: string;
        customer_details: string;
        properties: any[];
        discount_allocations: any[];
        tax_lines: any[];
        duties: any[];
        price_set: any;
        total_discount_set: any;
        origin_location: any[];
        variant_inventory_management: string;
        variant_inventory_policy: string | null;
        variant_fulfillment_service: string | null;
        location_id: number | null;
        fulfillment_line_item_id: number | null;
        created_at: string;
        updated_at: string;
      };
    };
  }> {
    return apiRequest<{
      success: boolean;
      message: string;
      data: {
        order_item: OrderItem & {
          order_number: string;
          order_url: string;
          order_created_at: string;
          order_updated_at: string;
          display_name: string;
          product_type: string;
          barcode: string;
          shopify_line_item_id: number;
          shopify_product_id: number;
          shopify_variant_id: number;
          total_price: number;
          total_discount: number;
          net_price: number;
          weight: number;
          weight_unit: string | null;
          grams: number;
          taxable: boolean;
          requires_shipping: boolean;
          gift_card: boolean;
          fulfillment_status: string | null;
          fulfillment_service: string;
          customer_email: string;
          customer_name: string;
          customer_details: string;
          properties: any[];
          discount_allocations: any[];
          tax_lines: any[];
          duties: any[];
          price_set: any;
          total_discount_set: any;
          origin_location: any[];
          variant_inventory_management: string;
          variant_inventory_policy: string | null;
          variant_fulfillment_service: string | null;
          location_id: number | null;
          fulfillment_line_item_id: number | null;
          created_at: string;
          updated_at: string;
        };
      };
    }>(`/order-items/${id}`);
  },

  // Get multiple order items by IDs
  async getMultipleOrderItems(ids: string): Promise<{
    success: boolean;
    message: string;
    data: {
      order_items: OrderItem[];
      count: number;
      requested_ids: number[];
      found_ids: number[];
    };
  }> {
    return apiRequest<{
      success: boolean;
      message: string;
      data: {
        order_items: OrderItem[];
        count: number;
        requested_ids: number[];
        found_ids: number[];
      };
    }>(`/order-items-multiple/${ids}`);
  },

  // Get WTB items with pagination
  async getWTBItems(page: number = 1, perPage: number = 10): Promise<WTBItemsResponse> {
    return apiRequest<WTBItemsResponse>(`/wtb-items?page=${page}&per_page=${perPage}`);
  },

  // Search WTB items
  async searchWTBItems(query: string, page: number = 1): Promise<WTBItemsResponse> {
    return apiRequest<WTBItemsResponse>(`/wtb-items?search=${encodeURIComponent(query)}&page=${page}`);
  },

  // Filter WTB items by vendor
  async getWTBItemsByVendor(vendor: string, page: number = 1): Promise<WTBItemsResponse> {
    return apiRequest<WTBItemsResponse>(`/wtb-items?vendor=${encodeURIComponent(vendor)}&page=${page}`);
  },
};
