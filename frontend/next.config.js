const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// Get API URL from environment or default to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const isDevelopment = process.env.NODE_ENV === 'development';

// Parse API URL to extract hostname
const apiUrlObj = new URL(API_URL);
const apiHostname = apiUrlObj.hostname;

// Build remote patterns dynamically
const remotePatterns = [];

// Always add API URL pattern for production
remotePatterns.push({
  protocol: apiUrlObj.protocol.replace(':', ''),
  hostname: apiHostname,
  port: apiUrlObj.port || (apiUrlObj.protocol === 'https:' ? '443' : '80'),
  pathname: '/storage/**',
});

// Only add localhost patterns in development
if (isDevelopment) {
  remotePatterns.push(
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/storage/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
      pathname: '/storage/**',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '9000',
      pathname: '/uploads/**',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '9001',
      pathname: '/uploads/**',
    }
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: isDevelopment ? ['example.com', 'localhost', '127.0.0.1', apiHostname] : [apiHostname],
    remotePatterns,
    unoptimized: false,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static optimization for pages that use client-side data fetching
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = withPWA(nextConfig);
