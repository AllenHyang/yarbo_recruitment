/*
 * @Author: Allen
 * @Date: 2025-06-09 18:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 18:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/messages/route.ts
 * @Description: 站内消息API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';

// 消息类型枚举
export enum MessageType {
  SYSTEM = 'system',
  HR_MESSAGE = 'hr_message',
  STATUS_UPDATE = 'status_update',
  APPLICATION_RECEIVED = 'application_received',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  APPLICATION_RESULT = 'application_result',
  INTERVIEW_INVITATION = 'interview_invitation',
  DOCUMENT_REQUEST = 'document_request'
}

// 消息优先级枚举
export enum MessagePriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

// 消息状态枚举
export enum MessageStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

// 消息接口
export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  receiver_role: string;
  title: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  status: MessageStatus;
  created_at: string;
  read_at?: string;
  metadata?: {
    application_id?: string;
    job_title?: string;
    status_change?: {
      from: string;
      to: string;
    };
    [key: string]: any;
  };
}

// 模拟消息数据存储
export const mockMessages = new Map<string, Message>([
  ['1', {
    id: '1',
    sender_id: 'system',
    sender_name: '系统',
    sender_role: 'system',
    receiver_id: 'zhangsan@example.com',
    receiver_name: '张三',
    receiver_role: 'candidate',
    title: '申请状态更新 - 资深全栈工程师',
    content: '您的申请状态已更新为"已录用"。恭喜！经过全面评估，您的技能和经验完全符合我们的要求。欢迎加入Yarbo团队！',
    type: MessageType.STATUS_UPDATE,
    priority: MessagePriority.HIGH,
    status: MessageStatus.UNREAD,
    created_at: '2025-06-10 06:04:49',
    metadata: {
      application_id: '1',
      job_title: '资深全栈工程师',
      status_change: {
        from: '审核中',
        to: '已录用'
      }
    }
  }],
  // 为演示账户添加测试消息
  ['demo1', {
    id: 'demo1',
    sender_id: 'system',
    sender_name: '系统',
    sender_role: 'system',
    receiver_id: 'test.candidate@gmail.com',
    receiver_name: '演示候选人',
    receiver_role: 'candidate',
    title: '欢迎使用Yarbo招聘系统',
    content: '欢迎您使用Yarbo智能招聘系统！这是一条演示消息，展示站内消息功能。您可以在这里查看申请状态更新、面试通知等重要信息。',
    type: MessageType.SYSTEM,
    priority: MessagePriority.NORMAL,
    status: MessageStatus.UNREAD,
    created_at: '2025-06-10 06:00:00',
    metadata: {
      welcome_message: true
    }
  }],
  ['2', {
    id: '2',
    sender_id: 'hr@yarbo.com',
    sender_name: 'HR团队',
    sender_role: 'hr',
    receiver_id: 'zhangsan@example.com',
    receiver_name: '张三',
    receiver_role: 'candidate',
    title: '欢迎加入Yarbo！入职准备事项',
    content: '恭喜您成功加入Yarbo团队！请准备以下入职材料：1. 身份证复印件 2. 学历证明 3. 银行卡信息 4. 体检报告。我们将在明天与您联系确认入职时间。',
    type: MessageType.HR_MESSAGE,
    priority: MessagePriority.HIGH,
    status: MessageStatus.UNREAD,
    created_at: '2025-06-10 06:10:00',
    metadata: {
      application_id: '1',
      job_title: '资深全栈工程师'
    }
  }],
  ['3', {
    id: '3',
    sender_id: 'system',
    sender_name: '系统',
    sender_role: 'system',
    receiver_id: 'lisi@example.com',
    receiver_name: '李四',
    receiver_role: 'candidate',
    title: '面试邀请 - 前端工程师',
    content: '您好！我们很高兴通知您，您的申请已通过初步筛选。我们诚邀您参加技术面试，面试时间：2025年6月12日 下午2:00，地点：Yarbo办公室会议室A。',
    type: MessageType.INTERVIEW_SCHEDULED,
    priority: MessagePriority.NORMAL,
    status: MessageStatus.READ,
    created_at: '2025-06-09 14:30:00',
    read_at: '2025-06-09 15:45:00',
    metadata: {
      application_id: '2',
      job_title: '前端工程师',
      interview_date: '2025-06-12 14:00:00',
      location: 'Yarbo办公室会议室A'
    }
  }]
]);

// GET /api/messages - 获取用户消息列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    // 筛选用户消息
    let userMessages = Array.from(mockMessages.values()).filter(
      message => message.receiver_id === userId
    );

    // 按状态筛选
    if (status) {
      userMessages = userMessages.filter(message => message.status === status);
    }

    // 按类型筛选
    if (type) {
      userMessages = userMessages.filter(message => message.type === type);
    }

    // 按时间倒序排列
    userMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 分页处理
    const total = userMessages.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = userMessages.slice(startIndex, endIndex);

    // 统计未读消息数量
    const unreadCount = userMessages.filter(message => message.status === MessageStatus.UNREAD).length;

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('获取消息列表错误:', error);
    return NextResponse.json(
      { success: false, error: '获取消息列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/messages - 发送新消息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sender_id,
      sender_name,
      sender_role,
      receiver_id,
      receiver_name,
      receiver_role,
      title,
      content,
      type,
      priority = MessagePriority.NORMAL,
      metadata
    } = body;

    // 验证必要参数
    const requiredFields = ['sender_id', 'receiver_id', 'title', 'content', 'type'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `缺少必要字段: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // 生成新消息ID
    const messageId = (mockMessages.size + 1).toString();

    // 创建新消息
    const newMessage: Message = {
      id: messageId,
      sender_id,
      sender_name: sender_name || '未知发送者',
      sender_role: sender_role || 'user',
      receiver_id,
      receiver_name: receiver_name || '未知接收者',
      receiver_role: receiver_role || 'candidate',
      title,
      content,
      type,
      priority,
      status: MessageStatus.UNREAD,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      metadata
    };

    // 保存消息
    mockMessages.set(messageId, newMessage);

    console.log('📨 新消息已创建:', {
      id: messageId,
      from: `${sender_name} (${sender_role})`,
      to: `${receiver_name} (${receiver_role})`,
      title,
      type
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: '消息发送成功'
    });

  } catch (error) {
    console.error('发送消息错误:', error);
    return NextResponse.json(
      { success: false, error: '发送消息失败' },
      { status: 500 }
    );
  }
}
