/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./.data/**/*"],
    "/admin/**/*": ["./.data/**/*"],
    "/student/**/*": ["./.data/**/*"]
  }
};

export default nextConfig;
