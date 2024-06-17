/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@azure/storage-blob", "@azure/monitor-opentelemetry", "@opentelemetry/api", "@opentelemetry/instrumentation"],
    instrumentationHook: true,
  }
};

module.exports = nextConfig;
