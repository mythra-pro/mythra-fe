import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Skip static generation for dashboard pages (require wallet)
  skipTrailingSlashRedirect: true,
  
  // Reduce memory usage during build
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
