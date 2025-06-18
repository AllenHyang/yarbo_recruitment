/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在开发和构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  // AWS Amplify 优化配置
  images: {
    unoptimized: true, // AWS Amplify 兼容性
  },
  trailingSlash: false, // AWS Amplify 默认配置
  // 启用构建缓存以提高性能
  experimental: {
    webpackBuildWorker: true,
  },
  // Webpack 配置优化
  webpack: (config, { isServer }) => {
    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

module.exports = nextConfig