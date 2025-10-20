import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['http://82.25.110.29:3000', 'https://tourillo.com'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'tourillo.com',
        pathname: '/uploads/**',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
