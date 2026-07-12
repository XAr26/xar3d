import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['view.tsx', 'view.ts', 'api.ts'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api.xar3d.com',
      },
      {
        // Railway backend URL — sesuaikan jika subdomain berubah
        protocol: 'https',
        hostname: '*.up.railway.app',
      },
    ],
  },
};

export default nextConfig;
