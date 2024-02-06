/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@azure/storage-blob"],
  },
  instrumentationHook: true,
};

module.exports = nextConfig;
