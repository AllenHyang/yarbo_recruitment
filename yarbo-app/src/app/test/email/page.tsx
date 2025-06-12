/*
 * @Author: Allen
 * @Date: 2025-06-09 10:45:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 10:45:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/test/email/page.tsx
 * @Description: 邮件系统测试页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [candidateName, setCandidateName] = useState('张三');
  const [jobTitle, setJobTitle] = useState('高级前端工程师');
  const [applicationId, setApplicationId] = useState('APP2025060900001');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestEmail = async (type: string) => {
    setIsLoading(true);
    setMessage(`正在发送 ${type} 邮件...`);
    
    // 模拟发送邮件
    setTimeout(() => {
      setIsLoading(false);
      setMessage(`✅ ${type} 邮件发送成功！`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              📧 邮件系统测试中心
            </h1>
            <p className="text-gray-600 text-lg">
              测试 Yarbo 招聘平台的邮件通知功能（演示版本）
            </p>
          </div>

          {/* 测试配置 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>⚙️ 测试配置</CardTitle>
              <CardDescription>
                设置测试邮件的收件人和内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testEmail">测试邮箱</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="candidateName">候选人姓名</Label>
                  <Input
                    id="candidateName"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="张三"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">职位名称</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="高级前端工程师"
                  />
                </div>
                
                <div>
                  <Label htmlFor="applicationId">申请编号</Label>
                  <Input
                    id="applicationId"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="APP2025060900001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快速测试按钮 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🚀 快速测试</CardTitle>
              <CardDescription>
                一键发送不同类型的邮件通知（演示模式）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleTestEmail('申请确认')}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-lg">📝</span>
                  <span>申请确认邮件</span>
                </Button>
                
                <Button
                  onClick={() => handleTestEmail('HR通知')}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-lg">👥</span>
                  <span>HR通知邮件</span>
                </Button>
                
                <Button
                  onClick={() => handleTestEmail('状态更新')}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-lg">🔄</span>
                  <span>状态更新邮件</span>
                </Button>
                
                <Button
                  onClick={() => handleTestEmail('面试邀请')}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-lg">📅</span>
                  <span>面试邀请邮件</span>
                </Button>
              </div>
              
              {message && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-600">{message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 说明信息 */}
          <Card>
            <CardHeader>
              <CardTitle>ℹ️ 说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 这是邮件系统的演示版本，实际邮件功能需要在API路由中实现</p>
                <p>• 邮件模板和发送逻辑已在后端API中配置</p>
                <p>• 生产环境需要配置正确的SMTP服务器信息</p>
                <p>• 支持多种邮件类型：申请确认、HR通知、状态更新、面试邀请等</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 