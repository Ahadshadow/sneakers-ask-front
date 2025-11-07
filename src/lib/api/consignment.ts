import { config } from '@/lib/config';

// Consignment API Types
export interface ConsignerAddress {
  ID: number;
  accountID: number;
  name: string;
  surname: string;
  fullName: string;
  address: string;
  addressExtra?: string;
  postcode: string;
  city: string;
  county: string | null;
  countyCode: string | null;
  country: string;
  countryCode: string | null;
  email: string;
  phone: string | null;
  phoneCountryCode: string;
  phoneNumber: string;
  validated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsignerInfo {
  since: string;
  name: string;
  email: string;
  lastVisitAt: string;
  phoneNumber: string;
  tier: string;
  status: string;
  fulfillmentPolicy: string;
  onboardingQuestions: string | null;
  paymentMethods?: any[];
  shippingAddress?: ConsignerAddress;
  saleChannels?: any[];
  stripeAccount?: any;
  revolutAccount?: any;
  analytics?: any;
}

export interface MatchedConsignmentItem {
  outbound_order_id: number;
  outbound_order_reference: string;
  transaction_id: number;
  transaction_reference: string;
  transaction_amount: string;
  variant_size: string;
  consigner: ConsignerInfo;
  consigner_metadata: any | null;
  flipromo_product_id: number;
  flipromo_order_line_item_id: number;
  consignor_id: number;
  product_details?: any;
  db_order_item?: any;
}

export interface VerifyConsignerSuccessResponse {
  success: true;
  message: string;
  order_number: string;
  matched_items: MatchedConsignmentItem[];
}

export interface VerifyConsignerErrorResponse {
  success: false;
  message: string;
  order_number: string;
}

export type VerifyConsignerResponse = VerifyConsignerSuccessResponse | VerifyConsignerErrorResponse;

export interface VerifyConsignerRequest {
  order_number: string;
  order_line_item_ids?: number[];
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
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

export const consignmentApi = {
  /**
   * Verify consigner details for a consignment order
   */
  async verifyConsigner(request: VerifyConsignerRequest): Promise<VerifyConsignerResponse> {
    return apiRequest<VerifyConsignerResponse>('/flipromo/verify-consigner', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

