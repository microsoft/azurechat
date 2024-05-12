/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Powered-By",
    value: "Queensland Government",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src *.typekit.net 'self' 'unsafe-inline'; frame-ancestors 'self'; img-src 'self' https://www.google.com https://www.google.com.au data:; font-src *.typekit.net 'self' data:; connect-src 'self'  https://js.monitor.azure.com https://qdap-dev-apim.azure-api.net https://qdap-prd-apim.developer.azure-api.net *.ai.qld.gov.au *.applicationinsights.azure.com https://australiaeast.livediagnostics.monitor.azure.com https://analytics.google.com https://www.google-analytics.com https://stats.g.doubleclick.net; media-src 'self'; frame-src 'self'; object-src 'none'; upgrade-insecure-requests",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(),autoplay=(),camera=(),clipboard-read=(self),clipboard-write=(self),display-capture=(),encrypted-media=(),fullscreen=(),geolocation=(),gyroscope=(),magnetometer=(),microphone=(),midi=(),payment=(),picture-in-picture=(),publickey-credentials-get=(),screen-wake-lock=(),sync-xhr=(self),usb=(),xr-spatial-tracking=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "X-Download-Options",
    value: "noopen",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "require-corp",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
]

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compress: false,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  devIndicators: {
    buildActivityPosition: "bottom-right",
  },
  experimental: {
    instrumentationHook: true,
    serverActions: {
      allowedOrigins: ["*.ai.qld.gov.au", "qggptprodopenai.azurewebsites.net", "qggptdevopenai.azurewebsites.net"],
    },
  },
  redirects() {
    return [
      {
        source: "/chatai",
        destination: "/chat",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/api/auth/signin/azure-ad",
        permanent: true,
      },
      {
        source: "/logout",
        destination: "/api/auth/signout",
        permanent: true,
      },
      {
        source: "/support",
        destination: "https://dis-qgcdg.atlassian.net/servicedesk/customer/portal/2",
        permanent: true,
      },
    ]
  },
  headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withBundleAnalyzer(nextConfig)
