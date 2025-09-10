// Import apiRequest from sellers.ts where it's defined
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Common fields (same for all items)
export interface WTBOrderCommon {
  // 1. Seller ID
  seller_id: number;
  
  // 3. Buyer Country
  buyer_country: string;
  
  // 15. Payment Timing
  payment_timing: string;
}

// Item-specific fields (different for each item)
export interface WTBOrderItem {
  // 2. Order Item ID
  order_item_id: string;
  
  // 4. Seller VAT Registered
  seller_vat_registered: boolean;
  
  // 5. VAT Scheme
  vat_scheme: 'regular' | 'margin';
  
  // 6. VAT Rate
  vat_rate: number;
  
  // 7. VAT Amount
  vat_amount: number;
  
  // 8. VAT Refund Included
  vat_refund_included: boolean;
  
  // 9. Profit Margin Gross (Seller Payout Amount)
  profit_margin_gross: number;
  
  // 10. Profit Margin Net (Final Profit)
  profit_margin_net: number;
  
  // 11. Shipping Method
  shipping_method: string;
  
  // 12. Shipment Label File
  shipment_label_file: string | null;
  
  // 13. Seller Payout Amount
  seller_payout_amount: number;
  
  // 14. Seller Payout Amount with VAT
  seller_payout_amount_with_vat: number;
}

// Complete order data structure
export interface WTBOrderData {
  common: WTBOrderCommon;
  items: WTBOrderItem[];
}

export interface WTBOrderResponse {
  success: boolean;
  message: string;
  data: {
    order_id: string;
    status: string;
    created_at: string;
  };
}

export const wtbOrdersApi = {
  // Create single WTB order
  async createWTBOrder(common: WTBOrderCommon, item: WTBOrderItem): Promise<WTBOrderResponse> {
    const orderData: WTBOrderData = {
      common,
      items: [item]
    };
    
    return apiRequest<WTBOrderResponse>('/wtb-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Create bulk WTB orders
  async createBulkWTBOrders(common: WTBOrderCommon, items: WTBOrderItem[]): Promise<WTBOrderResponse> {
    const orderData: WTBOrderData = {
      common,
      items
    };
    
    return apiRequest<WTBOrderResponse>('/wtb-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
