/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@azure/storage-blob"],
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
