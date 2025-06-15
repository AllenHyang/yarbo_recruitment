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
  // 静态导出配置
  output: 'export',
  trailingSlash: true,
  // 禁用服务端功能以支持静态导出
  experimental: {
    appDir: true,
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