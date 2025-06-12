/*
 * @Author: Allen
 * @Date: 2025-06-09 19:30:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 19:30:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/messages/page.tsx
 * @Description: 消息中心页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { MessageCenter } from "@/components/MessageCenter";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Lock } from "lucide-react";

export default function MessagesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登录</h2>
            <p className="text-gray-600 mb-4">请先登录以查看您的消息</p>
            <a 
              href="/auth/login" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              前往登录
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <MessageCenter 
          userId={user.email} 
          userRole={user.role || 'candidate'} 
        />
      </div>
    </div>
  );
}
