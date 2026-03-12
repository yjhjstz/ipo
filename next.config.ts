import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/install.sh',
        destination: '/api/install.sh',
      },
    ]
  },
};

export default nextConfig;
