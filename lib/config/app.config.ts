/**
 * Application Configuration
 * Centralized configuration management for the JuisteBod backend
 */

// Detect if running on Vercel
const isVercel = !!process.env.VERCEL;
// Vercel timeout limits: 10s (Hobby), 60s (Pro)
// Use 8s for Hobby plan to be safe, or 55s for Pro
const vercelTimeout = process.env.VERCEL_ENV === 'production' ? 55000 : 8000;
const defaultTimeout = 45000; // 45 seconds for localhost

export const AppConfig = {
  // Scraping Configuration
  scraping: {
    timeout: isVercel ? vercelTimeout : defaultTimeout, // Adjust for Vercel limits
    retryAttempts: isVercel ? 2 : 5, // Fewer retries on Vercel due to timeout limits
    retryDelay: isVercel ? 1000 : 3000, // Faster retries on Vercel
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    ],
    allowedDomains: ['funda.nl', 'www.funda.nl', 'jaap.nl', 'www.jaap.nl'],
    maxConcurrentRequests: 1, // Only 1 at a time to avoid detection
    requestDelay: 2000, // 2 seconds delay between requests
    botDetectionDelay: 10000, // 10 seconds delay when bot detection is suspected
    humanLikeDelay: true, // Add random delays to appear more human
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Increased back to 100 for better user experience
    skipSuccessfulRequests: true, // Don't count successful requests
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