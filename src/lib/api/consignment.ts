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

export interface ConsignerMetadata {
  name: string;
  email: string;
  tier: string;
  status: string;
  createdAt: string;
  fulfillment_policy: string;
  saleChannels_title: string;
  payments: string;
}

export interface MatchedConsignmentItem {
  inbound_order_id: number;
  inbound_order_reference: string;
  inbound_line_item_id: number;
  outbound_line_item_id?: number;
  consigner: ConsignerAddress;
  consigner_metadata: ConsignerMetadata;
  flipromo_product_id: number;
  item_id: number;
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

