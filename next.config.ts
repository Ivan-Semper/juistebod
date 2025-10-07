import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper deployment
  output: 'standalone',
  
  // Disable static optimization for dynamic routes
  experimental: {
    serverComponentsExternalPackages: ['cheerio']
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
