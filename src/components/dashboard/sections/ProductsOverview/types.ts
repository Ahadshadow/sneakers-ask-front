export interface OrderReference {
  orderId: string;
  orderNumber: string;
  quantity: number;
  orderDate: string;
  customerName: string;
  orderTotal: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
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
  size?: string;
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