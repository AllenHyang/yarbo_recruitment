/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/notifications/route.ts
 * @Description: 通知系统API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/lib/database.types';

// GET /api/notifications - 获取用户通知列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const read = searchParams.get('read');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    // 构建查询
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    // 按读取状态筛选
    if (read !== null) {
      query = query.eq('read', read === 'true');
    }

    // 按类型筛选
    if (type) {
      query = query.eq('type', type);
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('获取通知列表错误:', error);
      return NextResponse.json(
        { success: false, error: '获取通知列表失败' },
        { status: 500 }
      );
    }

    // 获取未读通知数量
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
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
    console.error('通知API错误:', error);
    return NextResponse.json(
      { success: false, error: '获取通知失败' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - 创建新通知
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      message,
      user_id,
      user_role,
      metadata = {},
      action_url,
      action_type = 'internal'
    } = body;

    // 验证必要参数
    const requiredFields = ['type', 'title', 'message', 'user_id', 'user_role'];
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

    // 验证通知类型
    const validTypes = ['application_status', 'new_application', 'interview_scheduled', 'system_update', 'message_received'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的通知类型' },
        { status: 400 }
      );
    }

    // 验证用户角色
    const validRoles = ['candidate', 'hr', 'admin'];
    if (!validRoles.includes(user_role)) {
      return NextResponse.json(
        { success: false, error: '无效的用户角色' },
        { status: 400 }
      );
    }

    // 创建通知
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        type,
        title,
        message,
        user_id,
        user_role,
        metadata,
        action_url,
        action_type
      })
      .select()
      .single();

    if (error) {
      console.error('创建通知错误:', error);
      return NextResponse.json(
        { success: false, error: '创建通知失败' },
        { status: 500 }
      );
    }

    console.log('📢 新通知已创建:', {
      id: notification.id,
      type,
      title,
      user_id,
      user_role
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: '通知创建成功'
    });

  } catch (error) {
    console.error('创建通知API错误:', error);
    return NextResponse.json(
      { success: false, error: '创建通知失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - 批量更新通知状态
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_id, notification_ids } = body;

    if (!action || !user_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    let updateData: Partial<Notification> = {};
    
    switch (action) {
      case 'mark_read':
        updateData = { read: true };
        break;
      case 'mark_unread':
        updateData = { read: false };
        break;
      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型' },
          { status: 400 }
        );
    }

    // 构建查询
    let query = supabase
      .from('notifications')
      .update(updateData)
      .eq('user_id', user_id);

    // 如果指定了特定通知ID，只更新这些通知
    if (notification_ids && notification_ids.length > 0) {
      query = query.in('id', notification_ids);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('更新通知状态错误:', error);
      return NextResponse.json(
        { success: false, error: '更新通知状态失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      message: `成功${action === 'mark_read' ? '标记为已读' : '标记为未读'}`
    });

  } catch (error) {
    console.error('更新通知状态API错误:', error);
    return NextResponse.json(
      { success: false, error: '更新通知状态失败' },
      { status: 500 }
    );
  }
}
