import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standard build for Netlify with API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
