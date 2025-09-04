export interface OrderReference {
  orderId: string;
  orderNumber: string;
  quantity: number;
  orderDate: string;
  customerName: string;
  orderTotal: string;
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

// UI Product interface (for existing design compatibility)
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: "open" | "fliproom_sale" | "sneakerask" | "bought";
  seller: string;
  shopifyId: string;
  orders: OrderReference[];
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