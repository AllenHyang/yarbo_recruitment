/*
 * @Author: Allen
 * @Date: 2025-06-09 10:15:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 10:15:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/email/send/route.ts
 * @Description: 邮件发送API路由
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailType } from '@/lib/email';

// 邮件发送请求接口
interface EmailRequest {
  type: EmailType;
  to: string;
  data: {
    candidateName: string;
    jobTitle: string;
    applicationId: string;
    applicationDate?: string;
    interviewDate?: string;
    nextSteps?: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    
    // 验证请求数据
    if (!body.type || !body.to || !body.data) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 发送邮件
    const success = await emailService.sendNotificationEmail(
      body.type,
      body.to,
      {
        ...body.data,
        companyName: 'Yarbo Inc.',
        hrContactEmail: 'hr@yarbo.com',
        hrContactName: 'Yarbo HR团队'
      }
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '邮件发送成功' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: '邮件发送失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('邮件API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 测试邮件连接
export async function GET() {
  try {
    const isConnected = await emailService.verifyConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected ? '邮件服务连接正常' : '邮件服务连接失败'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '无法验证邮件服务' },
      { status: 500 }
    );
  }
} 