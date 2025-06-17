import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '🎉 Yarbo Recruitment API',
    version: '1.0.0',
    runtime: 'Next.js API Routes',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/test - 测试端点',
      'GET /api/jobs - 获取职位列表',
      'POST /api/applications/submit - 提交申请',
      'POST /api/auth/login - 用户登录',
      'POST /api/auth/register - 用户注册'
    ]
  });
} 