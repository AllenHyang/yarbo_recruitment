/** @type {import('next').NextConfig} */
const nextConfig = {
  // AWS Amplify SSR配置
  eslint: {
    // 在开发和构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  
  // AWS Amplify 图片优化设置
  images: {
    unoptimized: true,
    domains: [],
  },
  
  // 输出配置 - 确保支持服务器端渲染
  output: undefined, // 明确不使用 'export' 或 'standalone'
  
  // AWS Lambda 兼容性
  experimental: {
    webpackBuildWorker: true,
  },
  
  // 服务器外部包
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 服务器配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  },
  
  // Webpack优化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig