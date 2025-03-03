/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change from 'standalone' to 'export' for static hosting
  output: 'export',
  
  // Add basePath for GitHub Pages
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Disable React StrictMode in development to avoid double renders
  reactStrictMode: false,
  
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Required for static export
  },
  
  // Add configuration for handling dynamic routes
  trailingSlash: true,
  
  // Add experimental features
  experimental: {
    // Enable static export for dynamic routes
    runtime: 'edge',
  },

  // Configure static generation
  env: {
    NEXT_PUBLIC_BASE_PATH: '/expense-tracker',
  },
};

export default nextConfig;
