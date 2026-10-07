import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@canton-names/resolver'],
  async rewrites() {
    return [
      {
        source: '/pitch-judges',
        destination: '/pitch-judges/index.html',
      },
    ];
  },
};

export default nextConfig;
