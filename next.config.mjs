import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep server traces inside this application. The parent workspace also has a
  // lockfile, which otherwise makes Next infer the wrong deployment root.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
