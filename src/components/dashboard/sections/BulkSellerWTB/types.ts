export interface WTBRequest {
  id: string;
  productName: string;
  sku: string;
  size: string;
  quantity: number;
  payoutPrice: number;
  requestDate: string;
  status: "active" | "responded" | "closed";
  image: string;
}
