import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'virtualhorizonstorage.blob.core.windows.net',
      },
    ],
  },
};

export default nextConfig;
