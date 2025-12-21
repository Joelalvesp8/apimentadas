/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  runtimeCaching: [],
});

const nextConfig = {
  reactStrictMode: true,
  // Disable static optimization for pages that use location
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = withPWA(nextConfig);
