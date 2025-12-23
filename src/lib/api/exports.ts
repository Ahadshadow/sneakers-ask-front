// Exports API service layer
// This file handles all export-related API calls

import { config } from '@/lib/config';

// Base API configuration
const API_BASE_URL = config.api.baseUrl;
const API_TIMEOUT = config.api.timeout;

export interface SalesExportParams {
  from_date?: string; // Format: YYYY-MM-DD (e.g., "2025-12-01")
  to_date?: string;    // Format: YYYY-MM-DD (e.g., "2025-12-31")
}

/**
 * API Endpoint: GET /api/exports/sales
 * 
 * Examples:
 * - Get all delivered WTB orders: GET /api/exports/sales
 * - Get delivered WTB orders from December 1, 2025: GET /api/exports/sales?from_date=2025-12-01
 * - Get delivered WTB orders until December 31, 2025: GET /api/exports/sales?to_date=2025-12-31
 * - Get delivered WTB orders for December 2025: GET /api/exports/sales?from_date=2025-12-01&to_date=2025-12-31
 */

// Sales export API function that returns a file blob and content type
export interface ExportResponse {
  blob: Blob;
  contentType: string;
  filename?: string;
}

export const exportsApi = {
  async exportSales(params: SalesExportParams = {}): Promise<ExportResponse> {
    const token = localStorage.getItem('auth_token');
    const searchParams = new URLSearchParams();
    
    if (params.from_date) {
      searchParams.append('from_date', params.from_date);
    }
    if (params.to_date) {
      searchParams.append('to_date', params.to_date);
    }
    
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/exports/sales${queryString ? `?${queryString}` : ''}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Get content type from response headers
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Try to get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('content-disposition');
      let filename: string | undefined;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Return the blob and metadata for file download
      const blob = await response.blob();
      return { blob, contentType, filename };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error - please check your connection');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },
};

