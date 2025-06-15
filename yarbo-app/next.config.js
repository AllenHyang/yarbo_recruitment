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
  // Cloudflare Pages 优化配置
  images: {
    unoptimized: true, // Cloudflare Pages 不支持 Next.js 图片优化
  },
  // 移除 output 配置，使用默认模式
  trailingSlash: true,
  // 禁用构建缓存以避免大文件
  experimental: {
    webpackBuildWorker: false,
  },
  // Webpack 配置优化
  webpack: (config, { isServer }) => {
    // 禁用缓存以避免大文件
    config.cache = false;
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