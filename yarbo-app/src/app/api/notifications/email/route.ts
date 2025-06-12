/*
 * @Author: Allen
 * @Date: 2025-06-09 17:30:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 17:30:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/notifications/email/route.ts
 * @Description: 邮件通知API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  sendStatusChangeNotification, 
  StatusChangeNotificationData 
} from '@/lib/notification';

// POST /api/notifications/email - 发送邮件通知
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // 验证必要参数
    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'status_change':
        // 验证状态变更通知数据
        const requiredFields = [
          'candidateName', 'candidateEmail', 'jobTitle', 
          'oldStatus', 'newStatus', 'companyName', 'hrName'
        ];
        
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: `缺少必要字段: ${missingFields.join(', ')}` 
            },
            { status: 400 }
          );
        }

        // 发送状态变更通知
        result = await sendStatusChangeNotification(data as StatusChangeNotificationData);
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的通知类型' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          messageId: result.messageId,
          type,
          sentAt: new Date().toISOString()
        },
        message: '邮件发送成功'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || '邮件发送失败' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('邮件通知API错误:', error);
    return NextResponse.json(
      { success: false, error: '邮件发送失败' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/email - 获取邮件发送历史（可选功能）
export async function GET(request: NextRequest) {
  try {
    // 这里可以实现邮件发送历史查询
    // 目前返回模拟数据
    const mockHistory = [
      {
        id: '1',
        type: 'status_change',
        to: 'zhangsan@example.com',
        subject: '申请状态更新 - 资深全栈工程师 | Yarbo Inc.',
        sentAt: '2025-06-09 17:30:00',
        status: 'sent',
        messageId: 'mock_1733123456789_abc123'
      },
      {
        id: '2',
        type: 'status_change',
        to: 'lisi@example.com',
        subject: '申请状态更新 - 前端工程师 | Yarbo Inc.',
        sentAt: '2025-06-09 16:45:00',
        status: 'sent',
        messageId: 'mock_1733120456789_def456'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockHistory,
      total: mockHistory.length
    });

  } catch (error) {
    console.error('获取邮件历史错误:', error);
    return NextResponse.json(
      { success: false, error: '获取邮件历史失败' },
      { status: 500 }
    );
  }
}
