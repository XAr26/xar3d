import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['view.tsx', 'view.ts', 'api.ts'],
  images: {
    domains: ["127.0.0.1", "localhost"],
  },
};

export default nextConfig;
