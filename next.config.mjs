/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change from 'standalone' to 'export' for static hosting
  output: 'export',
  
  // Add basePath for GitHub Pages - uncomment when deploying to GitHub Pages
  basePath: '/expense-tracker',
  
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
  },
  
  // Add configuration for handling dynamic routes
  trailingSlash: true,
  distDir: 'out',
  
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
  
  // Add configuration for handling dynamic routes in static export
  experimental: {
    appDir: true,
    serverActions: true,
    // Optimize package imports
    optimizePackageImports: ['react', 'react-dom', 'firebase'],
  },
};

export default nextConfig;
