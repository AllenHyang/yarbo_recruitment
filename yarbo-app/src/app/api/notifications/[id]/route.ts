/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/notifications/[id]/route.ts
 * @Description: 单个通知操作API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/notifications/[id] - 获取单个通知详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '通知不存在' },
          { status: 404 }
        );
      }
      console.error('获取通知详情错误:', error);
      return NextResponse.json(
        { success: false, error: '获取通知详情失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('获取通知详情API错误:', error);
    return NextResponse.json(
      { success: false, error: '获取通知详情失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/[id] - 更新单个通知
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { read, user_id } = body;

    // 验证用户权限 - 只能更新自己的通知
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    if (typeof read === 'boolean') {
      updateData.read = read;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '没有要更新的字段' },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id) // 确保只能更新自己的通知
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '通知不存在或无权限' },
          { status: 404 }
        );
      }
      console.error('更新通知错误:', error);
      return NextResponse.json(
        { success: false, error: '更新通知失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: '通知更新成功'
    });

  } catch (error) {
    console.error('更新通知API错误:', error);
    return NextResponse.json(
      { success: false, error: '更新通知失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - 删除单个通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id); // 确保只能删除自己的通知

    if (error) {
      console.error('删除通知错误:', error);
      return NextResponse.json(
        { success: false, error: '删除通知失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '通知删除成功'
    });

  } catch (error) {
    console.error('删除通知API错误:', error);
    return NextResponse.json(
      { success: false, error: '删除通知失败' },
      { status: 500 }
    );
  }
}
