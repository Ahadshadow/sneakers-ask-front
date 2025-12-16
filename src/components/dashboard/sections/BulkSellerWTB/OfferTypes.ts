export interface Offer {
  id: string;
  wtbRequestId: string;
  productName: string;
  sku: string;
  size: string;
  offeredQuantity: number;
  offeredPrice: number;
  wtbPayoutPrice: number;
  status: "pending" | "accepted" | "rejected";
  submittedDate: string;
  image: string;
}

export interface Sale {
  id: string;
  offerId: string;
  productName: string;
  sku: string;
  size: string;
  quantity: number;
  salePrice: number;
  totalAmount: number;
  status: "confirmed" | "packaged" | "shipped" | "delivered";
  saleDate: string;
  image: string;
  trackingNumber?: string;
}

export interface Shipment {
  id: string;
  sales: Sale[];
  trackingNumber: string;
  carrier: string;
  createdDate: string;
  estimatedDelivery: string;
  status: "pending" | "in_transit" | "delivered";
  totalItems: number;
}
