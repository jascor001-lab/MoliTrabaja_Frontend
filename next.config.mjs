/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
