/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  swcMinify: false,
  experimental: {
    serverComponentsExternalPackages: ["@azure/storage-blob"],
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
