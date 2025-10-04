export interface OrderReference {
  orderId: string;
  orderNumber: string;
  quantity: number;
  orderDate: string;
  customerName: string;
  orderTotal: string;
  orderUrl?: string; // Add order URL support
  products?: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
}

// API Product interface (from backend)
export interface ApiProduct {
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

// New Order Item interface (from new API response)
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

// UI Product interface (for existing design compatibility)
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: "open" | "sourcing" | "stock" | "fliproom_sale" | "sneakerask" | "bought";
  seller: string;
  shopifyId: string;
  orders: OrderReference[];
  orderUrl?: string; // Add order URL support for the product
  variant?: string; // Add variant support
  // Additional fields for bulk WTB order
  orderId?: number;
  orderNumber?: string;
  orderCreatedAt?: string;
  currency?: string;
  totalPrice?: number;
  netPrice?: number;
  totalDiscount?: number;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: {
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    country_code: string;
    zip: string;
    phone: string;
  };
  productType?: string;
  vendor?: string;
  quantity?: number;
  weight?: number;
  weightUnit?: string;
  taxable?: boolean;
  requiresShipping?: boolean;
  fulfillmentStatus?: string;
  taxLines?: any[];
  // New fields from API response
  destination?: string;
  manualStatus?: string;
  processedAt?: string;
}

export interface WTBPurchase {
  id: string;
  product: {
    name: string;
    sku: string;
  };
  seller: string;
  payoutPrice: number;
  shippingMethod: string;
  status: "processing" | "shipped" | "delivered";
  purchaseDate: string;
}