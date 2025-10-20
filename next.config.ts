import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment optimization
  output: 'standalone',
  
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
  
  // Reduce memory usage during build
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;