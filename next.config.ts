import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/pitch',
        destination: '/pitch/index.html',
      },
      {
        source: '/pitch-judges',
        destination: '/pitch-judges/index.html',
      },
    ];
  },
};

export default nextConfig;
