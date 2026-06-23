import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'virtualhorizonstorage.blob.core.windows.net',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://backend-production-1958b.up.railway.app",
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};


export default nextConfig;
