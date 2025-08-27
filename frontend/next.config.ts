import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
