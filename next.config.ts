import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  images: {
    qualities: [70, 75, 80, 92],
    imageSizes: [16, 32, 48, 64, 96, 128, 180, 200, 225, 256, 288, 320, 384],
    deviceSizes: [384, 640, 750, 828, 1080, 1200],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
