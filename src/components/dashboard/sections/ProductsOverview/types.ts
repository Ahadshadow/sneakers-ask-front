export interface OrderReference {
  orderId: string;
  orderNumber: string;
  quantity: number;
  orderDate: string;
  customerName: string;
  orderTotal: string;
}

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
  productId: string;
  product: Product;
  payout: string;
  shippingMethod: string;
  purchaseDate: string;
  status: "processing" | "shipped" | "delivered";
}