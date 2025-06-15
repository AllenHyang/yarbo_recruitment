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
import { supabase } from '@/lib/supabase';
import { Message } from '@/lib/database.types';

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

// 消息接口 - 现在使用数据库类型
// export interface Message - 已在 database.types.ts 中定义

// 消息数据现在存储在数据库中，不再使用mock数据

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

    // 构建查询
    let query = supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId);

    // 按状态筛选
    if (status) {
      query = query.eq('status', status);
    }

    // 按类型筛选
    if (type) {
      query = query.eq('type', type);
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: messages, error, count } = await query;

    if (error) {
      console.error('获取消息列表错误:', error);
      return NextResponse.json(
        { success: false, error: '获取消息列表失败' },
        { status: 500 }
      );
    }

    // 获取未读消息数量
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('status', 'unread');

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        },
        unreadCount: unreadCount || 0
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

    // 创建新消息
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
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
        status: 'unread',
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('创建消息错误:', error);
      return NextResponse.json(
        { success: false, error: '消息发送失败' },
        { status: 500 }
      );
    }

    console.log('📨 新消息已创建:', {
      id: newMessage.id,
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
