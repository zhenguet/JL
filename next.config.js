/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/JL',
  assetPrefix: '/JL/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

