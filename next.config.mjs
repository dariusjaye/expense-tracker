/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change from 'standalone' to 'export' for static hosting
  output: 'export',
  
  // Add basePath for GitHub Pages
  basePath: '/expense-tracker',
  assetPrefix: '/expense-tracker/',
  
  // Disable React StrictMode in development to avoid double renders
  reactStrictMode: false,
  
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "cdn.veryfi.com",
      },
    ],
    unoptimized: true, // Required for static export
  },
  
  // Add configuration for handling dynamic routes
  trailingSlash: true,
  
  // Add experimental features
  experimental: {
    appDir: true,
  },

  // Configure static generation
  env: {
    NEXT_PUBLIC_BASE_PATH: '/expense-tracker',
  },
};

export default nextConfig;
