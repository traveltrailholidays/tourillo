import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*'],
  images: {
    unoptimized: true,
    qualities: [25, 50, 75, 85, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'tourillo.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb', // Reduced since we compress on client
      allowedOrigins: ['*'],
    },
  },
  // output: 'standalone',
};

export default nextConfig;
