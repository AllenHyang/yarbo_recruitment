/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化配置
  images: {
    domains: ['eipqxgdqittupttmpiud.supabase.co'], // Supabase 存储域名
    formats: ['image/avif', 'image/webp'],
  },
  
  // 确保路径正确
  trailingSlash: false,
  
  // 启用严格模式
  reactStrictMode: true,
  
  // 生产环境优化
  poweredByHeader: false,
  
  // 暂时忽略构建错误
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
