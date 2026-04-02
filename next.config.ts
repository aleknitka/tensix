import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
