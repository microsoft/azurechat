/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: "22mb",
  },
  webpack: (config) => {
    config.externals = [...config.externals, "hnswlib-node"];

    return config;
  },
};

module.exports = nextConfig;
