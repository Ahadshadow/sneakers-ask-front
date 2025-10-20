import { config } from '@/lib/config';

// SendCloud API Types
export interface SendCloudSenderAddress {
  name: string;
  company_name: string;
  address_line_1: string;
  house_number: string;
  address_line_2: string;
  postal_code: string;
  city: string;
  po_box?: string | null;
  state_province_code?: string | null;
  country_code: string;
  email: string;
  phone_number: string;
  signature: {
    full_name: string;
    initials: string;
  };
  is_active: boolean;
  brand_id: number;
  tax_numbers: Array<{
    name: string;
    country_code: string;
    value: string;
  }>;
}

export interface SendCloudShippingOption {
  code: string; // e.g. "ups:express/live_rates,saturday"
  name: string; // human readable name
  carrier: {
    code: string;
    name: string;
  };
  product: {
    code: string;
    name: string;
  };
  functionalities: Record<string, unknown>;
  max_dimensions?: {
    width: string;
    length: string;
    height: string;
    unit: string;
  };
  weight?: {
    min: { value: string; unit: string };
    max: { value: string; unit: string };
  };
  billed_weight?: {
    unit: string;
    value: string;
    volumetric: boolean;
  };
  contract?: {
    id: number;
    client_id: string;
    carrier_code: string;
    name: string;
  };
  requirements?: Record<string, unknown>;
  quotes?: unknown[];
  charging_type?: string;
}

export interface SendCloudParcel {
  dimensions: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  weight: {
    value: string;
    unit: string;
  };
}

export interface SendCloudShippingOptionsRequest {
  from_country_code: string;
  to_country_code: string;
  parcels: SendCloudParcel[];
}

export interface SendCloudShipmentLabel {
  id: number;
  tracking_number: string;
  label_url: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
}

class SendCloudAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.sendcloud.baseUrl;
    this.apiKey = config.sendcloud.apiKey;
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Authorization': `Basic ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch sender addresses from our backend
   */
  async getSenderAddresses(): Promise<SendCloudSenderAddress[]> {
    try {
      const response = await fetch(`${config.api.baseUrl}/sendcloud/sender-addresses`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sender addresses: ${response.statusText}`);
      }

      const data = await response.json();

      return data?.data?.data || [];
    } catch (error) {
      console.error('Error fetching sender addresses:', error);
      throw error;
    }
  }

  /**
   * Fetch shipping options from our backend
   */
  async getShippingOptions(request: SendCloudShippingOptionsRequest): Promise<SendCloudShippingOption[]> {
    try {
      const response = await fetch(`${config.api.baseUrl}/sendcloud/shipping-options`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shipping options: ${response.statusText}`);
      }

      const data = await response.json();
      // Backend returns { data: { data: [...] } }
      return data?.data?.data || [];
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      throw error;
    }
  }

  /**
   * Create shipment label through our backend
   */
  async createShipmentLabel(shipmentData: any): Promise<SendCloudShipmentLabel> {
    try {
      const response = await fetch(`${config.api.baseUrl}/sendcloud/create-label`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create shipment label: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating shipment label:', error);
      throw error;
    }
  }

  /**
   * Get default parcel dimensions from config
   */
  getDefaultParcel(): SendCloudParcel {
    return {
      dimensions: {
        length: config.sendcloud.packageDimensions.length,
        width: config.sendcloud.packageDimensions.width,
        height: config.sendcloud.packageDimensions.height,
        unit: config.sendcloud.packageDimensions.unit,
      },
      weight: {
        value: config.sendcloud.packageWeight.value,
        unit: config.sendcloud.packageWeight.unit,
      },
    };
  }
}

export const sendcloudApi = new SendCloudAPI();
