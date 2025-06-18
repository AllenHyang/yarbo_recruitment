import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除standalone模式，使用默认SSR
  // output: 'standalone',
  
  // 启用图片优化
  images: {
    domains: [], // 根据需要添加外部图片域名
  },
  
  // 确保启用SSR
  trailingSlash: false,
  
  // 启用实验性功能（如果需要）
  experimental: {
    // serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
