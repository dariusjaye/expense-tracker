/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change from 'standalone' to 'export' for static hosting
  output: 'export',
  
  // Add basePath for GitHub Pages - uncomment when deploying to GitHub Pages
  basePath: '/business-expense-tracker',
  
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
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true, // Required for static export
  },
  
  // Disable the API rewrites as they might be causing conflicts
  // Comment out the rewrites section for now
  /*
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.openai.com/:path*",
      },
    ];
  },
  */
  
  // Add experimental features to improve performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['react', 'react-dom', 'firebase'],
  },
};

export default nextConfig;
