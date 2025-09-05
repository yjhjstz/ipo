import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static2.finnhub.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.finnhub.io',
        port: '',
        pathname: '/**',
      },
      // Allow common news image domains
      {
        protocol: 'https',
        hostname: '*.reuters.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cnbc.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.bloomberg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wsj.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ft.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.marketwatch.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.yahoo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cnn.com',
        port: '',
        pathname: '/**',
      },
      // Generic HTTPS pattern for news images (be more permissive)
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
