// Application configuration
// This file centralizes all configuration values

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    timeout: 10000, // 10 seconds
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'SneakerAsk Admin',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG === 'true',
  },
  
  // Auth Configuration
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },
  
  // Pagination Configuration
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // UI Configuration
  ui: {
    toastDuration: 5000, // 5 seconds
    animationDuration: 200, // 200ms
  },
} as const;

// Type for configuration
export type Config = typeof config;
