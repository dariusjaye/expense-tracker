/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change from 'standalone' to 'export' for static hosting
  output: 'export',
  
  // Set basePath and assetPrefix for GitHub Pages
  basePath: '/expense-tracker',
  assetPrefix: '/expense-tracker/',
  
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
  
  // Remove experimental runtime config as it's causing issues with static export
  experimental: {},

  // Remove env config since we're hardcoding basePath
  env: {},
};

export default nextConfig;
