/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@azure/storage-blob"],
    // Document upload posts the file through a Server Action, whose body limit
    // defaults to 1mb. Keep this in step with MAX_UPLOAD_DOCUMENT_SIZE so the
    // app's own size check is the one that rejects oversized files.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

module.exports = nextConfig;
