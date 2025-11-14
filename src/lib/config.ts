// Application configuration
// This file centralizes all configuration values

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    timeout: 1000000, // 10 seconds
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
  
  // SendCloud Configuration
  sendcloud: {
    apiKey: import.meta.env.VITE_SENDCLOUD_API_KEY,
    baseUrl: import.meta.env.VITE_SENDCLOUD_BASE_URL || 'https://panel.sendcloud.sc/api/v3',
    packageDimensions: {
      length: import.meta.env.VITE_SENDCLOUD_PACKAGE_LENGTH || '30',
      width: import.meta.env.VITE_SENDCLOUD_PACKAGE_WIDTH || '20',
      height: import.meta.env.VITE_SENDCLOUD_PACKAGE_HEIGHT || '15',
      unit: import.meta.env.VITE_SENDCLOUD_PACKAGE_UNIT || 'cm',
    },
    packageWeight: {
      value: import.meta.env.VITE_SENDCLOUD_PACKAGE_WEIGHT || '2',
      unit: import.meta.env.VITE_SENDCLOUD_WEIGHT_UNIT || 'kg',
    },
  },
} as const;

// Type for configuration
export type Config = typeof config;
