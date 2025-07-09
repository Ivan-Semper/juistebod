/**
 * Application Configuration
 * Centralized configuration management for the JuisteBod backend
 */

export const AppConfig = {
  // Scraping Configuration
  scraping: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds (increased for bot detection)
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    ],
    allowedDomains: ['funda.nl', 'www.funda.nl', 'jaap.nl', 'www.jaap.nl'],
    maxConcurrentRequests: 2, // Reduced to avoid rate limiting
    requestDelay: 1500, // Delay between requests
    botDetectionDelay: 5000, // Extra delay when bot detection is suspected
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // Reduced from 100 to be more conservative
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // Data Validation
  validation: {
    maxUrlLength: 2000,
    maxDescriptionLength: 1000,
    maxImageUrls: 20,
    maxFeatures: 50,
  },

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    enableConsole: true,
    enableFile: process.env.NODE_ENV === 'production',
    logDirectory: './logs',
  },

  // API Configuration
  api: {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    maxRequestSize: '10mb',
  },

  // Security
  security: {
    enableHelmet: true,
    enableCors: true,
    trustProxy: true,
    rateLimitSkipIPs: ['127.0.0.1', '::1'],
  },

  // Performance
  performance: {
    enableCompression: true,
    enableCaching: true,
    cacheMaxAge: 300000, // 5 minutes
    enableRequestProfiling: process.env.NODE_ENV === 'development',
  },
} as const;

export type AppConfigType = typeof AppConfig; 