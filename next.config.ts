import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standard build for Netlify with API routes
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Help prevent chunk loading errors
  experimental: {
    esmExternals: false,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
