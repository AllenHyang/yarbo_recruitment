import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用静态导出模式
  output: 'export',
  
  // 静态导出模式下的图片配置
  images: {
    unoptimized: true, // 静态导出需要
  },
  
  // 确保路径正确
  trailingSlash: false,
  
  // 禁用不兼容静态导出的功能
  // experimental: {},
};

export default nextConfig;
