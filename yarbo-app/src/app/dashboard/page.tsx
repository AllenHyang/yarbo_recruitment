"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold">用户中心</h1>
          <p className="text-gray-600">欢迎回来！</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>邮箱:</strong> {user.email}</p>
              <p><strong>用户ID:</strong> {user.id}</p>
              <p><strong>状态:</strong> 已登录</p>
            </div>
          ) : (
            <p className="text-red-600">未登录</p>
          )}
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">管理员入口</h3>
          <p className="text-gray-600 mb-4">如果您是管理员或HR，请访问:</p>
          <a 
            href="/hr/dashboard" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            前往HR管理后台
          </a>
        </div>
      </div>
    </div>
  );
} 