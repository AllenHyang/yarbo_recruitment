import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化服务器端渲染部署
  output: 'standalone',
  
  // 启用图片优化
  images: {
    domains: [], // 根据需要添加外部图片域名
  },
  
  // 启用实验性功能（如果需要）
  experimental: {
    // serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
