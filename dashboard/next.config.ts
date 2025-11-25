// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output
  output: "standalone",

  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
