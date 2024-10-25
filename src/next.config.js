/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["@azure/storage-blob", "@azure/monitor-opentelemetry", "@opentelemetry/api", "@opentelemetry/instrumentation", "@opentelemetry/sdk-trace-base"], 
};

module.exports = nextConfig;
