/*
 * @Author: Allen
 * @Date: 2025-06-09 18:30:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 18:30:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/messages/[id]/route.ts
 * @Description: 单个消息管理API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { MessageStatus } from '../route';
import { supabase } from '@/lib/supabase';

// GET /api/messages/[id] - 获取单个消息详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '消息不存在' },
          { status: 404 }
        );
      }
      console.error('获取消息详情错误:', error);
      return NextResponse.json(
        { success: false, error: '获取消息详情失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('获取消息详情错误:', error);
    return NextResponse.json(
      { success: false, error: '获取消息详情失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/messages/[id] - 更新消息状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, userId } = body;

    const message = mockMessages.get(id);
    if (!message) {
      return NextResponse.json(
        { success: false, error: '消息不存在' },
        { status: 404 }
      );
    }

    // 验证用户权限（只能更新自己的消息）
    if (userId && message.receiver_id !== userId) {
      return NextResponse.json(
        { success: false, error: '无权限操作此消息' },
        { status: 403 }
      );
    }

    // 更新消息状态
    if (status) {
      const oldStatus = message.status;
      message.status = status;

      // 如果标记为已读，记录已读时间
      if (status === MessageStatus.READ && oldStatus === MessageStatus.UNREAD) {
        message.read_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }

      // 保存更新
      mockMessages.set(id, message);

      console.log('📨 消息状态已更新:', {
        id,
        from: oldStatus,
        to: status,
        readAt: message.read_at
      });
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: '消息状态更新成功'
    });

  } catch (error) {
    console.error('更新消息状态错误:', error);
    return NextResponse.json(
      { success: false, error: '更新消息状态失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[id] - 删除消息
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const message = mockMessages.get(id);
    if (!message) {
      return NextResponse.json(
        { success: false, error: '消息不存在' },
        { status: 404 }
      );
    }

    // 验证用户权限
    if (userId && message.receiver_id !== userId) {
      return NextResponse.json(
        { success: false, error: '无权限删除此消息' },
        { status: 403 }
      );
    }

    // 软删除：标记为已删除而不是真正删除
    message.status = MessageStatus.DELETED;
    mockMessages.set(id, message);

    console.log('📨 消息已删除:', {
      id,
      title: message.title,
      deletedBy: userId
    });

    return NextResponse.json({
      success: true,
      message: '消息删除成功'
    });

  } catch (error) {
    console.error('删除消息错误:', error);
    return NextResponse.json(
      { success: false, error: '删除消息失败' },
      { status: 500 }
    );
  }
}
