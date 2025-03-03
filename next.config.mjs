/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static exports
  images: {
    unoptimized: true, // Required for static export
    domains: [
      'cdn.shopify.com',
      'firebasestorage.googleapis.com',
      'expense-tracker-32f45.firebasestorage.app',
    ],
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable server-side features for static export
  experimental: {
    appDir: true,
  },
  // Ensure proper handling of trailing slashes
  trailingSlash: true,
  // Add proper headers for GitHub Pages
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Disable server-side features that aren't compatible with static export
  webpack: (config, { isServer }) => {
    // Disable server-side features
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
