/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      handlebars: 'handlebars/dist/handlebars.min.js'
    };
    return config;
  },
  serverActions: {
    allowedOrigins: ["http://localhost:3000", "https://dnaseq-delta.vercel.app/"]
  }
}

module.exports = nextConfig;